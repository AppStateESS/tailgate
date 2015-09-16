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

            case 'getLottery':
                $json = $this->getLottery();
                break;
        }

        $view = new \View\JsonView($json);
        return $view;
    }

    private function getCurrent()
    {
        $factory = new Factory;
        $game = $factory->getCurrent();
        return $game->getStringVars();
    }

    private function getLottery()
    {
        $studentFactory = new \tailgate\Factory\Student;
        $student = $studentFactory->getCurrentStudent();
        $factory = new \tailgate\Factory\Lottery;
        $game_id = filter_input(INPUT_GET, 'game_id', FILTER_SANITIZE_NUMBER_INT);
        $student_id = $student->getId();
        $lottery = $factory->getLotteryEntry($game_id, $student_id);
        if ($lottery) {
            return $lottery->getStringVars();
        } else {
            return null;
        }
    }

    public function post(\Request $request)
    {
        
        $view = new \View\JsonView(array('success' => true));
        $response = new \Response($view);

        $command = $request->getVar('command');
        switch ($command) {
            case 'apply':
                $this->applyToLottery();
                break;
        }
        return $response;
    }

    private function applyToLottery()
    {
        $lottery = new \tailgate\Factory\Lottery;
        $game_id = filter_input(INPUT_POST, 'game_id', FILTER_SANITIZE_NUMBER_INT);
        $lottery->apply($game_id);
    }

}
