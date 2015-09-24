<?php

namespace tailgate\Controller\User;

use tailgate\Factory\Game as Factory;
use tailgate\Resource\Game as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Game extends Base
{

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'getCurrent':
                $json = $this->getCurrent();
                break;
        }

        $view = new \View\JsonView($json);
        return $view;
    }

    private function getCurrent()
    {
        $factory = new Factory;
        $game = $factory->getCurrent();
        if ($game) {
            return $game->getStringVars();
        } else {
            return null;
        }
    }

    public static function userStatusSidebar()
    {
        $vars['current_game'] = Factory::getGameStatus();
        $vars['student_status'] = \tailgate\Factory\Lottery::getStudentStatus();

        $template = new \Template;
        $template->addVariables($vars);
        $template->setModuleTemplate('tailgate', 'User/sidebar.html');
        $content = $template->get();

        \Layout::add($content, 'tailgate', 'user_info');
    }

}
