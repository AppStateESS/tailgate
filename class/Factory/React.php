<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class React
{

    public static function load($directory, $development = true, $addons = true)
    {
        if ($development) {
            $script_file = 'src/script.jsx';
            $type = 'text/jsx';
        } else {
            $script_file = 'build/script.js';
            $type = 'text/javascript';
        }

        $data['development'] = $development;
        $data['addons'] = $addons;
        javascript('react', $data);
        $root_directory = PHPWS_SOURCE_HTTP . 'mod/tailgate/javascript/';
        $script_header = <<<EOF
    <script type="$type" src="$root_directory$directory$script_file"></script>';
EOF;
        \Layout::addJSHeader($script_header);
    }

}
