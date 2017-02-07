<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Game as Factory;
use tailgate\Resource\Game as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Game extends Base
{

    protected function getJsonView($data, \Canopy\Request $request)
    {
        $json = array();
        $command = $request->getVar('command');
        $factory = new Factory;
        $lotteryFactory = new \tailgate\Factory\Lottery;

        switch ($command) {
            case 'list':
                $game = Factory::getCurrent();
                if ($game) {
                    if ($game->getLotteryRun()) {
                        $json['available_spots'] = count(\tailgate\Factory\Lottery::getAvailableSpots());
                        $lottery = new \tailgate\Factory\Lottery;
                        $json['winners'] = $lottery->getTotalWinners($game->getId());
                        $json['claimed'] = $lottery->totalSpotsClaimed($game->getId());
                    } else {
                        $json['available_spots'] = $lotteryFactory->totalAvailableSpots();
                    }
                }
                break;

            case 'getCurrent':
                $json = $factory->getCurrentAsArray();
                break;

            case 'getAvailableSpots':
                $json = array('available_spots' => $factory->totalAvailableSpots());
                break;

            case 'unixtime':
                $json['unixtime'] = strtotime(filter_input(INPUT_GET, 'date', FILTER_SANITIZE_STRING));
                break;
            
            default:
                throw new \Exception('Unknown command');
        }

        $view = new \View\JsonView($json);
        return $view;
    }

    public function post(\Canopy\Request $request)
    {
        $factory = new Factory;
        $view = new \View\JsonView(array('success' => true));

        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        switch ($request->getVar('command')) {
            case 'add':
                $factory->postNew();
                break;

            case 'updateSignupStart':
                $view = new \View\JsonView($this->updateSignupStart());
                break;
            
            case 'updateSignupEnd':
                $view = new \View\JsonView($this->updateSignupEnd());
                break;
            
            case 'updatePickupDeadline':
                $view = new \View\JsonView($this->updatePickupDeadline());
                break;
            
            case 'updateKickoff':
                $view = new \View\JsonView($this->updateKickoff());
                break;
            
            case 'complete':
                $this->completeGame();
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
        $response = new \Canopy\Response($view);
        return $response;
    }

    private function completeGame()
    {
        $game = Factory::getCurrent();
        Factory::completeGame($game->getId());
    }
    
    private function updateSignupStart()
    {
        $game = Factory::getCurrent();

        $signup_start_unix = $this->getUnix('date');
        if ($game->getSignupEnd() < $signup_start_unix) {
            $json['error'] = 'Signup start must precede the signup end.';
            $json['success'] = false;
        } else {
            $game->setSignupStart($signup_start_unix);
            Factory::saveResource($game);
            $json['success'] = true;
        }
        return $json;
    }

    private function updateSignupEnd()
    {
        $game = Factory::getCurrent();

        $signup_end_unix = $this->getUnix('date');
        if ($game->getSignupStart() > $signup_end_unix) {
            $json['error'] = 'Signup end must proceed the signup start.';
            $json['success'] = false;
        } elseif ($game->getPickupDeadline() < $signup_end_unix) {
            $json['error'] = 'Signup end must preceed the pickup deadline.';
            $json['success'] = false;
        } else {
            $game->setSignupEnd($signup_end_unix);
            Factory::saveResource($game);
            $json['success'] = true;
        }
        return $json;
    }

    private function updatePickupDeadline()
    {
        $game = Factory::getCurrent();

        $pickup_deadline_unix = $this->getUnix('date');
        if ($game->getSignupEnd() > $pickup_deadline_unix) {
            $json['error'] = 'Pickup deadline must proceed the signup end.';
            $json['success'] = false;
        } elseif ($game->getKickoff() < $pickup_deadline_unix) {
            $json['error'] = 'Pickup deadline must preceed the kickoff.';
            $json['success'] = false;
        } else {
            $game->setPickupDeadline($pickup_deadline_unix);
            Factory::saveResource($game);
            $json['success'] = true;
        }
        return $json;
    }

    private function updateKickoff()
    {
        $game = Factory::getCurrent();

        $kickoff_unix = $this->getUnix('date');
        if ($game->getPickupDeadline() > $kickoff_unix) {
            $json['error'] = 'Kickoff deadline must proceed the pickup deadline.';
            $json['success'] = false;
        } else {
            $game->setKickoff($kickoff_unix);
            Factory::saveResource($game);
            $json['success'] = true;
        }
        return $json;
    }

    private function getUnix($post_var)
    {
        $datetime = filter_input(INPUT_POST, $post_var, FILTER_SANITIZE_STRING);
        return strtotime($datetime);
    }

    private function changeDate()
    {
        $factory = new Factory;

        $game_id = filter_input(INPUT_POST, 'game_id', FILTER_SANITIZE_NUMBER_INT);
        $kickoff = filter_input(INPUT_POST, 'kickoff', FILTER_SANITIZE_STRING);
        $signup_start = filter_input(INPUT_POST, 'signup_start', FILTER_SANITIZE_STRING);
        $signup_end = filter_input(INPUT_POST, 'signup_end', FILTER_SANITIZE_STRING);
        $pickup_deadline = filter_input(INPUT_POST, 'pickup_deadline', FILTER_SANITIZE_STRING);

        $game = new Resource;
        $game->setId($game_id);
        $factory->load($game);

        if (!empty($kickoff)) {
            $game->setKickoff(strtotime($kickoff));
        } elseif (!empty($signup_start)) {
            $game->setSignupStart(strtotime($signup_start));
        } elseif (!empty($signup_end)) {
            $game->setSignupEnd(strtotime($signup_end));
        } elseif (!empty($pickup_deadline)) {
            $game->setPickupDeadline(strtotime($pickup_deadline));
        } else {
            throw new \Exception('Date not sent');
        }

        $factory->save($game);
        $garray = $game->getStringVars();
        $garray = $factory->addVisitorInformation($garray);
        $view = new \View\JsonView($garray);
        return $view;
    }

}
