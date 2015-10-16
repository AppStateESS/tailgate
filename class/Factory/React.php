<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class React
{

    public static function load($directory, $filename, $development = true, $addons = true)
    {
        if ($development) {
            $script_file = 'src/' . $filename . '.jsx';
            $type = 'text/jsx';
        } else {
            $script_file = 'build/' . $filename . '.js';
            $type = 'text/javascript';
        }

        $data['development'] = $development;
        $data['addons'] = $addons;
        javascript('react', $data);
        $root_directory = PHPWS_SOURCE_HTTP . 'mod/tailgate/javascript/';
        $script_header = "<script type='$type' src='$root_directory$directory$script_file'></script>";
        \Layout::addJSHeader($script_header, 'tailgateReact');
    }

}
