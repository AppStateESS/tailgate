<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Student as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Student extends Base
{

    protected function getJsonView($data, \Canopy\Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'list':
                $json = $factory->getList();
                break;
        }

        $view = new \phpws2\View\JsonView($json);
        return $view;
    }

    public function post(\Canopy\Request $request)
    {
        $factory = new Factory;
        $view = new \phpws2\View\JsonView(array('success' => true));

        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        switch ($request->getVar('command')) {
            case 'ban':
                $factory->ban($request->getVar('id'), $request->getVar('reason'));
                break;

            case 'unban':
                $factory->unban($request->getVar('id'));
                break;

            case 'ineligible':
                $factory->ineligible($request->getVar('id'), $request->getVar('reason'));
                break;

            case 'eligible':
                $factory->eligible($request->getVar('id'));
                break;

            case 'delete':
                $factory->delete($request->getVar('id'));
                break;

            case 'assign':
                if (!$this->assign()) {
                    $view = new \phpws2\View\JsonView(array('success' => false));
                }
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
        $response = new \Canopy\Response($view);
        return $response;
    }

    private function assign()
    {
        $spot_id = filter_input(INPUT_POST, 'spotId', FILTER_SANITIZE_NUMBER_INT);
        $student_id = filter_input(INPUT_POST, 'studentId', FILTER_SANITIZE_NUMBER_INT);

        $game = \tailgate\Factory\Game::getCurrent();

        if (!\tailgate\Factory\Game::isAfterPickup()) {
            throw new \Exception('Cannot assign spots until after pickup.');
        }

        if (\tailgate\Factory\Lottery::spotPickedUp($spot_id)) {
            return false;
        } else {
            \tailgate\Factory\Lottery::assignStudent($student_id, $spot_id);
            return true;
        }
    }

}
