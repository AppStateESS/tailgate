<?php

namespace tailgate\Controller;
define('TAILGATE_DEFAULT_ADMIN_COMMAND', 'Setup');
/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Admin extends \Http\Controller
{

    public function get(\Request $request)
    {
        $command = $this->getAdminCommand($request);
        return $command->get($request);
    }

    public function post(\Request $request)
    {
        $command = $this->getAdminCommand($request);
        return $command->post($request);
    }

    private function getAdminCommand($request)
    {
        $command = $request->shiftCommand();
        
        if (empty($command)) {
            $command = TAILGATE_DEFAULT_ADMIN_COMMAND;
        }

        $className = 'tailgate\Controller\Admin\\' . $command;
        if (!class_exists($className)) {
            throw new \Http\NotAcceptableException($request);
        }
        $adminCommand = new $className($this->getModule());
        return $adminCommand;
    }
}
