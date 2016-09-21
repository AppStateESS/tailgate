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
        $root_directory = PHPWS_SOURCE_HTTP . 'mod/tailgate/javascript/dist';
        if ($development) {
            $script_file = $filename . '.dev.js';
        } else {
            $script_file = $filename . '.prod.js';
        }
        $script_header = "<script type='text/javascript' src='$root_directory/$script_file'></script>";
        return $script_header;
    }

}
