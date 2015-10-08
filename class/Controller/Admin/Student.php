<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Student as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Student extends Base
{

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'list':
                $json = $factory->getList();
                break;

            case 'getAvailableSpots':
                $json = \tailgate\Factory\Lottery::getAvailableSpots(null, null, true);
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
                $view = $this->assign();
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
        $response = new \Response($view);
        return $response;
    }

    private function assign()
    {
        $spot_id = filter_input(INPUT_POST, 'spotId', FILTER_SANITIZE_NUMBER_INT);
        $student_id = filter_input(INPUT_POST, 'studentId', FILTER_SANITIZE_NUMBER_INT);
        if (\tailgate\Factory\Lottery::spotTaken($spot_id)) {
            $view = new \View\JsonView(array('success' => false));
        } else {
            \tailgate\Factory\Lottery::assignStudent($student_id, $spot_id);
            $view = new \View\JsonView(array('success' => true));
        }
        return $view;
    }

}
