jQuery(document).ready(function () {


    let start_date = moment().subtract(1, "month").format('YYYY-MM-DD')
    // let startOf = moment(start_date).startOf('month').format('YYYY-MM-DD')
    // let endOf = moment(start_date).endOf('month').format('YYYY-MM-DD')

    jQuery("#from_date").flatpickr({
        allowInput: false,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        defaultDate: `${start_date} 00:00`,
        maxDate: moment().format('YYYY-MM-DD'),
    });

    jQuery("#to_date").flatpickr({
        allowInput: false,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        defaultDate: `today`,
        maxDate: moment().format('YYYY-MM-DD'),
    });

    performance_filter();
    jQuery(document).on("change", ".performance_filter", function () {
        performance_filter();
    })
});

function performance_filter() {
    const startDate = $('#from_date').val();
    const endDate = $('#to_date').val();

    let from = moment(startDate);
    let to = moment(endDate);
    let date_diff = from.diff(to, "seconds");

    jQuery(".performance_filter_error").html("");
    jQuery(".degin-labl").removeClass("date_error");
    if (date_diff > 0) {
        jQuery(".degin-labl").addClass("date_error");
        jQuery(".performance_filter_error").html("Start date can't be greater than end date");
        return jQuery.notify({ message: "Start date can't be greater than end date" }, { type: "danger" });
    }

    jQuery.ajax({
        type: "POST",
        cache: false,
        dataType: "json",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify({
            store_id: store_id,
            startDate,
            endDate
        }),
        url: `${ajax_url}/dashboard/filter`,
        success: function (response) {
            if (response) {
                load_performance_section(response)
            } else {
                jQuery.notify({ message: response.message }, { type: "danger" });
            }
        },
        error: function (response) {
            jQuery.notify({ message: response.message }, { type: "danger" });
        },
    });
}

function load_performance_section(response) {
    const { money_format, cart_data, checkout_detail, upsell_performance, cart_performance, all_cart } = response;

    let { all_checkout, reached_checkout, completed_checkout } = checkout_detail;
    let { upsell_revenue, upsell_shown, upsell_added, upsell_purchased } = upsell_performance;

    let shop_conversion_rate = completed_checkout && all_checkout ? (parseFloat(completed_checkout) * 100 / parseFloat(all_checkout)).toFixed(2) : '00.00';
    let added_to_cart_percentage = cart_data && all_cart ? (parseFloat(cart_data.length) * 100 / parseFloat(all_cart.length)).toFixed(2) : '00.00';

    added_to_cart_percentage = added_to_cart_percentage === 'NaN' ? '00.00' : added_to_cart_percentage

    jQuery(".shop_conversion_rate").html(`${shop_conversion_rate} <span class="accent">%</span>`);

    let added_to_cart_count = cart_data && cart_data.length > 1 ? `${cart_data.length} times` : `${cart_data.length} time`
    jQuery(".added_to_cart").html(`${added_to_cart_count}`);
    jQuery(".added_to_cart_percentage").html(`${added_to_cart_percentage} <span class="accent">%</span>`);

    /////////////////////////////////////////// Get Checkout Metrics
    let reached_checkout_percentage = reached_checkout && all_checkout ? (parseFloat(reached_checkout) * 100 / parseFloat(all_checkout)).toFixed(2) : '00.00';
    let reached_count_percentage = shop_conversion_rate

    let reached_checkout_count = reached_checkout > 1 ? `${reached_checkout} times` : `${reached_checkout} time`
    jQuery(".reached_checkout").html(`${reached_checkout_count}`);
    jQuery(".reached_checkout_percentage").html(`${reached_checkout_percentage} <span class="accent">%</span>`);

    let completed_checkout_count = completed_checkout > 1 ? `${completed_checkout} times` : `${completed_checkout} time`
    jQuery(".completed_checkout").html(`${completed_checkout_count}`);
    jQuery(".reached_count_percentage").html(`${reached_count_percentage} <span class="accent">%</span>`);


    /////////////////////////////////////////// Get Upsell Metrics
    let upsell_shown_percentage = upsell_shown ? (parseFloat(upsell_shown) * 100 / parseFloat(upsell_shown)).toFixed(2) : '00.00';
    let upsell_added_percentage = upsell_added && upsell_shown ? (parseFloat(upsell_added) * 100 / parseFloat(upsell_shown)).toFixed(2) : '00.00'
    let upsell_purchased_percentage = upsell_purchased && upsell_shown ? (parseFloat(upsell_purchased) * 100 / parseFloat(upsell_shown)).toFixed(2) : '00.00'

    jQuery(".upsell_revenue").html(`${money_format} ${upsell_revenue.toFixed(2)}`);

    let upsell_shown_count = upsell_shown > 1 ? `${upsell_shown} times` : `${upsell_shown} time`
    jQuery(".upsell_shown_times").html(`${upsell_shown_count}`);
    jQuery(".upsell_shown_percentage").html(`${upsell_shown_percentage} <span class="accent">%</span>`);

    let upsell_added_count = upsell_added > 1 ? `${upsell_added} times` : `${upsell_added} time`
    jQuery(".upsell_added").html(`${upsell_added_count}`);
    jQuery(".upsell_added_percentage").html(`${upsell_added_percentage} <span class="accent">%</span>`);

    let upsell_purchased_count = upsell_purchased > 1 ? `${upsell_purchased} times` : `${upsell_purchased} time`
    jQuery(".upsell_purchased").html(`${upsell_purchased_count}`);
    jQuery(".upsell_purchased_percentage").html(`${upsell_purchased_percentage} <span class="accent">%</span>`);

    /////////////////////////////////////////// Get CartPerformance Metrics
    jQuery(".email_recovery_count").html(`${money_format} ${cart_performance?.email_recovery_count.toFixed(2)}`);
}