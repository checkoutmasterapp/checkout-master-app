const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const {
  SubscriptionProducts,
  SubscriptionPackage
} = require("../models");

//create the stripe products
module.exports.CreateProduct = async (req, res, next) => {
  const request_body = req.body;

  await stripe.products
    .create({
      name: request_body.name,
      description: request_body.description,
    })
    .then(async function(response) {
      let invite_details = {
        object_id: response.id,
        name: request_body.name,
        description: request_body.description,
        created_by:req.session.id
      };
      await SubscriptionProducts.create(invite_details)
        .then(function(response) {
          return res.json({
            status: false,
            data: response,
          });
        })
        .catch((error) => {
          console.log("CreateProduct error-----------", error);
          return res.json({
            error: error,
            status: false,
            message: "Something went wrong. Please try again or reach out to support if the issue persists. or reach out to support if the issue persists.",
          });
        });
    })
    .catch((error) => {
      console.log("CreateProduct error-----------", error);
      return res.json({
        error: error,
        status: false,
        message: "Something went wrong. Please try again or reach out to support if the issue persists. or reach out to support if the issue persists.",
      });
    });
};

//get all products
module.exports.GetProducts = async (req, res, next) => {
  await SubscriptionProducts.findAll({
    order: [["name", "ASC"]],
    attributes: ["product_id", "object_id", "name", "description"],
    include: [
      {
      model: SubscriptionPackage,
      attributes: ["subscription_package_id", "product_id", "package_name", "billing_cycle", "price",  "package_description"],
             
      },
    ],
  })
  .then(async function (response) {
    return res.json({
      status: true,
      data: response,
      });
  })
      .catch((error) => {
          console.log("GetProducts error-----------", error);
          return res.json({
              error: error,
              status: false,
              message: "Something went wrong. Please try again or reach out to support if the issue persists. or reach out to support if the issue persists.",
          });
      });
};

//create subscription package price
module.exports.CreateSubscriptionPackage = async (req, res, next) => {
  const request_body = req.body;

  let product_detail = await SubscriptionProducts.findOne({
    where: {
      product_id: request_body.product_id,
    },
  });
  if (product_detail) {
    let product_id = product_detail.object_id;
    await stripe.prices
      .create({
        currency: "usd",
        product: product_id,
        unit_amount: request_body.price * 100,
        nickname: request_body.package_name,
        recurring: {
          interval: request_body.billing_cycle,
        },
        tax_behavior: "inclusive",
      })
      .then(async function(customer) {
        let subscription_package = {
          stript_object_id: customer.id,
          stript_object_type: customer.object,
          stript_object_description: "",

          is_freetrail: false,
          price: request_body.price,
          product_id: request_body.product_id,
          package_name: request_body.package_name,
          billing_cycle: request_body.billing_cycle,
          created_by:req.session.id
        };

        await SubscriptionPackage.create(subscription_package)
          .then(function(response) {
            return res.json({
              status: false,
              data: response,
            });
          })
          .catch((error) => {
            console.log("CreateSubscriptionPackage error -----------------", error);
            return res.json({
              error: error,
              status: false,
              message: "Something went wrong. Please try again or reach out to support if the issue persists. or reach out to support if the issue persists.",
            });
          });
      })
      .catch((error) => {
        console.log("CreateSubscriptionPackage error -----------------", error);
        return res.json({
          status: false,
          message: "Something went wrong. Please try again or reach out to support if the issue persists. or reach out to support if the issue persists.",
        });
      });
  } else {
    return res.json({
      status: false,
      message: "Bad request",
    });
  }
};

//get subscription packages
module.exports.GetSubscriptionPackages = async (req, res, next) => {
  await SubscriptionPackage.findAll({
      where: {
          is_active: true,
      },
      order: [["subscription_package_id", "ASC"]],
      attributes: ["subscription_package_id", "product_id", "package_name", "billing_cycle", "price"],
     
  })
      .then(function (response) {
          return res.json({
              status: true,
              data: response,
          });
      })
      .catch((error) => {
          console.log("GetSubscriptionPackages error-----------", error);
          return res.json({
              error: error,
              status: false,
              message: "Something went wrong. Please try again or reach out to support if the issue persists. or reach out to support if the issue persists.",
          });
      });
};

// create checkout session 
module.exports.CreateCheckOutSession = async (req, res, next) => {
  const domainURL = process.env.APP_URL;
  const {
    priceId
  } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{
        price: priceId,
        quantity: 1,
      }, ],
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `${domainURL}/successCheckout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}/cancelCheckout`,
      // automatic_tax: { enabled: true }
    });

    return res.redirect(303, session.url);
  } catch (e) {
    res.status(400);
    return res.send({
      error: {
        message: e.message,
      }
    });
  }
}

//cancel subscription 
module.exports.CancelSubscription = async (req, res, next) => {

  const request_body = req.body;
  let subscription = await SubscriptionPackage.findOne({
    where: {
      object_id: request_body.object_id,
      is_active: true
    },
  });
  if (subscription) {

    stripe.subscriptions.update(request_body.object_id, {
        cancel_at_period_end: true
      })
      .then(async function(cancelled) {
        await SubscriptionPackage.update({

          is_active: true
        }, {
          where: {
            object_id: request_body.object_id
          }
        })
        return res.json({
          status: true,
          message: 'Subscription cancelled successfully',
        });
      }).catch((error) => {
        return res.json({
          status: false,
          message: 'Something went wrong!'
        })
      })
  }

};

//customer portal 
module.exports.CustomerPortal = async (req, res, next) => {

  // Typically this is stored alongside the authenticated user in your database.
  let {
    sessionId
  } = req.body;

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.
  const returnUrl = process.env.APP_URL;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer,
    return_url: returnUrl,
  });
  res.json({
    status:true,
    url:portalSession.url
  } );
}

//retrieve checkout session data
module.exports.CheckoutSession = async (req, res, next) => {

  const {
    sessionId
  } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
}

//webhook -notify request
module.exports.Webhook = async (req, res, next) => {

  let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = process.env.WEBHOOK_ENDPOINT
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }
  
  switch (eventType) {
    case 'checkout.session.completed':
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      break;
    case 'invoice.paid':
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      break;
    case 'invoice.payment_failed':
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      break;
     
    default:
      // Unhandled event type
  }

  res.sendStatus(200);
};

//success checkout page
module.exports.SuccessCheckout = async (req, res, next) => {
  const mysession = {};
  mysession.id = req.query.session_id
  res.render("frontend/auth/successCheckout",{sessionId:mysession})
}
//cancel checkout page 
module.exports.CancelCheckout = async (req, res, next) => {
  res.render("frontend/auth/cancelCheckout")

}
// subscription page
module.exports.Subscription = async (req, res, next) => {
  res.render("frontend/auth/subscription");
};