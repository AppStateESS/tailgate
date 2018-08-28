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
            $script_file = 'build/' . self::getAssetPath($filename);
        }

        if (!$vendorUsed) {
            $vendorUsed = true;
            if ($development) {
                $vendorFile = $root_directory . '/dev/vendor.js';
            } else {
                $vendorFile = $root_directory . '/build/' . self::getAssetPath('vendor');
            }
            $vendor = <<<EOF
<script type="text/javascript" src="$vendorFile"></script>
EOF;
        }
        $script_header = <<<EOF
$vendor
<script type="text/javascript" src="$root_directory/$script_file"></script>
EOF;
        return $script_header;
    }

    protected static function getAssetPath($scriptName)
    {
        $rootDirectory = PHPWS_SOURCE_DIR . 'mod/tailgate/';
        echo $rootDirectory . 'assets.json';
        if (!is_file($rootDirectory . 'assets.json')) {
            exit('Missing assets.json file. Run `npm run build` in mod/tailgate directory.');
        }
        $jsonRaw = file_get_contents($rootDirectory . 'assets.json');
        $json = json_decode($jsonRaw, true);
        if (!isset($json[$scriptName]['js'])) {
            throw new \Exception('Script file not found among assets.');
        }
        return $json[$scriptName]['js'];
    }

}
