<?php

namespace tailgate\Controller;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class User extends \phpws2\Http\Controller
{

    public function get(\Canopy\Request $request)
    {
        $command = $this->routeCommand($request);
        return $command->get($request);
    }

    public function post(\Canopy\Request $request)
    {
        $command = $this->routeCommand($request);
        return $command->post($request);
    }

    private function routeCommand($request)
    {
        $command = $request->shiftCommand();

        if (empty($command)) {
            $command = 'Student';
        }

        $className = 'tailgate\Controller\User\\' . $command;
        if (!class_exists($className)) {
            \Canopy\Server::pageNotFound();exit;
        }
        $commandObject = new $className($this->getModule());
        return $commandObject;
    }

}
