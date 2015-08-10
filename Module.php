<?php

namespace tailgate;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Module extends \Module
{

    public function __construct()
    {
        parent::__construct();
        $this->setTitle('tailgate');
        $this->setProperName('Tailgating');
    }

    public function getController(\Request $request)
    {
        $cmd = $request->shiftCommand();
        if ($cmd == 'admin' && \Current_User::allow('tailgate')) {
            $admin = new \tailgate\Controller\Admin($this);
            return $admin;
        } else {
            $user = new \tailgate\Controller\User($this);
            return $user;
        }
    }

}
