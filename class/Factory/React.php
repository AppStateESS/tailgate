<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class React
{

    public static function load($filename, $development = true, $addons = true)
    {
        static $vendorUsed = false;
        $vendor = null;
        
        $root_directory = PHPWS_SOURCE_HTTP . 'mod/tailgate/javascript';
        if ($development) {
            $subdir = 'dev';
            $script_file = "dev/{$filename}.js";
        } else {
            $subdir = 'build';
            $script_file = "build/{$filename}.js";
        }
        
        if (!$vendorUsed) {
            $vendorUsed = true;
            $vendor = <<<EOF
<script type="text/javascript" src="$root_directory/$subdir/vendor.js"></script>
EOF;
        }
        $script_header = <<<EOF
$vendor
<script type="text/javascript" src="$root_directory/$subdir/{$filename}.js"></script>
EOF;
        return $script_header;
    }

}
