<?php

namespace tailgate;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Module extends \Module implements \SettingDefaults
{

    public function __construct()
    {
        parent::__construct();
        $this->setTitle('tailgate');
        $this->setProperName('Tailgating');
    }

    public function beforeRun(\Request $request, \Controller $controller)
    {
        require_once PHPWS_SOURCE_DIR . 'mod/tailgate/conf/defines.php';
    }

    public function getController(\Request $request)
    {
        $cmd = $request->shiftCommand();
        if ($cmd == 'Admin') {
            if (\Current_User::allow('tailgate')) {
                $admin = new \tailgate\Controller\Admin($this);
                return $admin;
            } else {
                \Current_User::requireLogin();
            }
        } else {
            $user = new \tailgate\Controller\User($this);
            return $user;
        }
    }

    public function runTime(\Request $request)
    {
        if (\PHPWS_Core::atHome()) {
            require_once PHPWS_SOURCE_DIR . 'mod/tailgate/conf/defines.php';
            \tailgate\Controller\User\Game::userStatusSidebar();
        }
    }
    
    public function getSettingDefaults()
    {
        $settings['new_account_information'] = '<p>Fill out a description of the Tailgate process in administration.</p>';
        $settings['reply_to'] = null;
        return $settings;
    }

}
