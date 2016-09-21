<?php

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */

// Show all items from table
define('TG_LIST_ALL', 1);

// Show only active elements
define('TG_LIST_ACTIVE', 2);

// Show only inactive elements
define('TG_LIST_INACTIVE', 3);


define('TAILGATE_DATE_FORMAT', '%h %e, %Y');
define('TAILGATE_TIME_FORMAT', '%l:%M%p');

if (!defined('SWIFT_MAIL_TRANSPORT_TYPE')) {
    define('SWIFT_MAIL_TRANSPORT_TYPE', 3);
}

define('REACT_DEVMODE', true);

define('WKPDF_PATH', '/usr/bin/wkhtmltopdf');

define('USE_XVFB', true);
define('XVFB_PATH', '/usr/bin/xvfb-run');

define('TAILGATE_BANNER_URL', 'url/to/banner/site');