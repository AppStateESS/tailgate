# tailgate

Module for phpWebSite.

Tailgate allows students to sign up for tailgate spots across campus. After a set time, a lottery is 
run to select who gets which spots.

Needs wkhtmltopdf package which requires xvfb. If your server is running php-fpm there are no explicit env variables set for php-fpm. You need to set the PATH variable so commands can be run. Put this in your php-fpm config(probably located /etc/php-fpm.d/www.conf).

[www] <br />
env[PATH] = '/usr/local/bin:/usr/bin:/bin'
