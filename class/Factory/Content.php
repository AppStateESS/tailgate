<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Content
{
    public function getList()
    {
        $json['new_account_information'] = \Settings::get('tailgate', 'new_account_information');
        return $json;
    }
    
    public function postContent()
    {
        $newAccountInformation = strip_tags(filter_input(INPUT_POST, 'newAccountInformation', FILTER_UNSAFE_RAW, 
                FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH | FILTER_FLAG_ENCODE_AMP), PHPWS_ALLOWED_TAGS);
        
        \Settings::set('tailgate', 'new_account_information', $newAccountInformation);
    }
}
