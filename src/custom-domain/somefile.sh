#!/bin/bash

# It will create apache config file for the vhost
echo "<VirtualHost *:80>
  ServerName dev1.checkout-master.com
  DocumentRoot /var/www/html/dev
  ErrorLog /var/log/apache2/dev1.checkout-master.com-error.log
  CustomLog /var/log/apache2/dev1.checkout-master.com-access.log combined

  SSLProxyEngine on
  SSLProxyVerify none
  ProxyPass / https://dev.checkout-master.com:8001/
  ProxyPassReverse / https://dev.checkout-master.com:8001/

</VirtualHost>" > /var/www/html/dev1.checkout-master.com.conf