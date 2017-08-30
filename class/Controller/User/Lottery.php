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

    public function getHtmlView($data, \Canopy\Request $request)
    {
        $command = $request->getVar('command');
        switch ($command) {
            case 'confirm':
                $content = $this->confirmWinner();
                break;

            default:
                echo \Canopy\Server::pageNotFound();
                exit;
        }
        $view = new \phpws2\View\HtmlView($content);
        return $view;
    }

    protected function getJsonView($data, \Canopy\Request $request)
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
                $lottery_id = filter_input(INPUT_GET, 'lotteryId',
                        FILTER_SANITIZE_NUMBER_INT);
                $json = $factory->getSpotByLotteryId($lottery_id);
                break;

            case 'spotChoice':
                $json = \tailgate\Factory\Lottery::getAvailableSpots();
                break;
        }

        $view = new \phpws2\View\JsonView($json);
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

    public function post(\Canopy\Request $request)
    {
        $view = new \phpws2\View\JsonView(array('success' => true));

        $command = $request->getVar('command');
        switch ($command) {
            case 'apply':
                $this->apply();
                break;

            case 'pickSpot':
                $view = $this->pickSpot();
                break;
        }
        $response = new \Canopy\Response($view);
        return $response;
    }

    private function apply()
    {
        $lottery = new \tailgate\Factory\Lottery;
        $game_id = filter_input(INPUT_POST, 'game_id',
                FILTER_SANITIZE_NUMBER_INT);
        $student = StudentFactory::getCurrentStudent();
        $student_id = $student->getId();
        $lottery->apply($student_id, $game_id);
    }

    private function pickSpot()
    {
        $student = StudentFactory::getCurrentStudent();
        $student_id = $student->getId();
        $lotteryFactory = new Factory;
        $spot_id = filter_input(INPUT_POST, 'spotId', FILTER_SANITIZE_NUMBER_INT);
        $lottery_id = filter_input(INPUT_POST, 'lotteryId',
                FILTER_SANITIZE_NUMBER_INT);
        $result = $lotteryFactory->pickSpot($lottery_id, $spot_id);

        $view = new \phpws2\View\JsonView(array('success' => $result));
        return $view;
    }

    private function confirmWinner()
    {
        $game = \tailgate\Factory\Game::getCurrent();

        $hash = filter_input(INPUT_GET, 'hash', FILTER_SANITIZE_STRING);
        $template = new \phpws2\Template;
        $factory = new Factory;
        $template->setModuleTemplate('tailgate', 'User/confirmation.html');
        $template->add('button_color', 'primary');

        if ($game->getPickupDeadline() < time()) {
            $template->add('message_color', 'danger');
            $template->add('message',
                    'Sorry, the confirmation deadline for this lottery has passed.');
            $template->add('url', \Canopy\Server::getSiteUrl());
            $template->add('label', 'Go back to home page');
            $content = $template->get();
            return $content;
        }

        $confirm = $factory->confirm($hash);
        if ($confirm) {
            $template->add('message_color', 'success');
            $template->add('message', 'Lottery win confirmed!');
            $auth = \Current_User::getAuthorization();
            if (!empty($auth->login_link)) {
                $url = PHPWS_HOME_HTTP . $auth->login_link;
            } else {
                $url = PHPWS_HOME_HTTP . 'index.php?module=users&action=user&command=login_page';
            }
            if (!\Current_User::isLogged()) {
                $template->add('url', $url);
                $template->add('label', 'Log in to pick your lot');
            } else {
                $template->add('url', \Canopy\Server::getSiteUrl() . 'tailgate/');
                $template->add('label', 'Go to your status page and pick a spot');
            }
        } else {
            $template->add('message_color', 'danger');
            $template->add('message',
                    'Sorry, could not confirm your lottery win. Contact us if you are having trouble.');
            $template->add('url', \Canopy\Server::getSiteUrl());
            $template->add('label', 'Go back to home page');
        }
        $content = $template->get();
        return $content;
    }

}
