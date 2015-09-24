<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Lottery as Factory;
use tailgate\Resource\Lottery as Resource;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lottery extends Base
{

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;
        $json = array('success' => true);

        switch ($command) {
            case 'getAvailableSpots':
                $json = array('available_spots' => $factory->totalAvailableSpots());
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
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
            case 'chooseWinners':
                $view = $this->chooseWinners();
                break;

            case 'complete':
                $factory->completeGame();
                break;

            case 'notify':
                $factory->notify();
                break;
            
            case 'completeLottery':
                $factory->completeLottery();
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
        $response = new \Response($view);
        return $response;
    }

    private function chooseWinners()
    {
        $factory = new Factory;
        $winners = $factory->chooseWinners();
        $spots_left = $factory->totalAvailableSpots() - $winners;
        $data = array('spots_filled' => $winners, 'spots_left' => $spots_left);
        $view = new \View\JsonView($data);
        return $view;
    }

}
