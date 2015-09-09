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

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'list':
                $json = $factory->getList();
                break;
        }

        $view = new \View\JsonView($json);
        return $view;
    }

    public function post(\Request $request)
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

            case 'changeDate':
                $view = $this->changeDate();
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
        $response = new \Response($view);
        return $response;
    }

    private function changeDate()
    {
        $factory = new Factory;

        $game_id = filter_input(INPUT_POST, 'game_id', FILTER_SANITIZE_NUMBER_INT);
        $kickoff = filter_input(INPUT_POST, 'kickoff', FILTER_SANITIZE_STRING);
        $signup_start = filter_input(INPUT_POST, 'signup_start', FILTER_SANITIZE_STRING);
        $signup_end = filter_input(INPUT_POST, 'signup_end', FILTER_SANITIZE_STRING);
        $game = new Resource;
        $game->setId($game_id);
        $factory->load($game);

        if (!empty($kickoff)) {
            $game->setKickoff(strtotime($kickoff));
        } elseif (!empty($signup_start)) {
            $game->setSignupStart(strtotime($signup_start));
        } elseif (!empty($signup_end)) {
            $game->setSignupEnd(strtotime($signup_end));
        } else {
            throw new \Exception('Date not sent');
        }
        
        $factory->save($game);
        $garray = $game->getStringVars();
        $garray = $factory->gameTime($garray);
        $garray = $factory->addVisitorInformation($garray);
        $view = new \View\JsonView($garray);
        return $view;
    }

}