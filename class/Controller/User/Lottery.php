<?php

namespace tailgate\Controller\User;

use tailgate\Factory\Lottery as Factory;
use tailgate\Factory\Student as StudentFactory;
use tailgate\Resource\Lottery as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lottery extends Base
{

    public function getHtmlView($data, \Request $request)
    {
        $command = $request->getVar('command');
        switch ($command) {
            case 'confirm':
                $content = $this->confirmWinner();
                break;
        }
        $view = new \View\HtmlView($content);
        return $view;
    }

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'get':
                $json = $this->getLottery();
                break;

            case 'getAvailableLots':
                $json = $factory->getAvailableLots();
                break;

            case 'getSpotInfo':
                $lottery_id = filter_input(INPUT_GET, 'lotteryId', FILTER_SANITIZE_NUMBER_INT);
                $json = $factory->getSpotByLotteryId($lottery_id);
                break;
        }

        $view = new \View\JsonView($json);
        return $view;
    }

    private function getLottery()
    {
        $student = StudentFactory::getCurrentStudent();
        $factory = new Factory;
        $game_id = filter_input(INPUT_GET, 'game_id', FILTER_SANITIZE_NUMBER_INT);
        $student_id = $student->getId();
        $lottery = $factory->getEntry($game_id, $student_id);
        if ($lottery) {
            return $lottery->getStringVars();
        } else {
            return null;
        }
    }

    public function post(\Request $request)
    {
        $view = new \View\JsonView(array('success' => true));

        $command = $request->getVar('command');
        switch ($command) {
            case 'apply':
                $this->apply();
                break;

            case 'pickLot':
                $view = $this->pickLot();
                break;
        }
        $response = new \Response($view);
        return $response;
    }

    private function apply()
    {
        $lottery = new \tailgate\Factory\Lottery;
        $game_id = filter_input(INPUT_POST, 'game_id', FILTER_SANITIZE_NUMBER_INT);
        $student = StudentFactory::getCurrentStudent();
        $student_id = $student->getId();
        $lottery->apply($student_id, $game_id);
    }

    private function pickLot()
    {
        $student = StudentFactory::getCurrentStudent();
        $student_id = $student->getId();
        $lotteryFactory = new Factory;
        $lot_id = filter_input(INPUT_POST, 'lotId', FILTER_SANITIZE_NUMBER_INT);
        $lottery_id = filter_input(INPUT_POST, 'lotteryId', FILTER_SANITIZE_NUMBER_INT);
        $number = $lotteryFactory->pickLot($lottery_id, $lot_id);
        $view = new \View\JsonView(array('number' => $number));
        return $view;
    }

    private function confirmWinner()
    {
        $hash = filter_input(INPUT_GET, 'hash', FILTER_SANITIZE_STRING);
        $template = new \Template;

        $factory = new Factory;
        $factory->confirm($hash);
        $template->setModuleTemplate('tailgate', 'User/confirmation.html');
        $template->add('login', \Server::getSiteUrl() . 'admin/');
        $content = $template->get();
        return $content;
    }

}
