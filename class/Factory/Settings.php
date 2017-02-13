<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Settings
{

    public function getList()
    {
        $json['new_account_information'] = \phpws2\Settings::get('tailgate', 'new_account_information');
        $json['reply_to'] = \phpws2\Settings::get('tailgate', 'reply_to');
        return $json;
    }

    public function postSettings()
    {
        $newAccountInformation = strip_tags(filter_input(INPUT_POST, 'newAccountInformation', FILTER_UNSAFE_RAW, FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH | FILTER_FLAG_ENCODE_AMP), PHPWS_ALLOWED_TAGS);

        \phpws2\Settings::set('tailgate', 'new_account_information', $newAccountInformation);
        $reply_to = filter_input(INPUT_POST, 'replyTo', FILTER_SANITIZE_EMAIL);
        if (empty($reply_to)) {
            throw new \Exception('Badly formed or empty email address');
        }
        \phpws2\Settings::set('tailgate', 'reply_to', $reply_to);
    }
}
