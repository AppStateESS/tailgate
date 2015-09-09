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
        }

        $view = new \View\JsonView($json);
        return $view;
    }

    public function post(\Request $request)
    {
        $factory = new Factory;
        $view = new \View\JsonView(array('success' => true));
        $response = new \Response($view);

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
            
            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
        return $response;
    }

}
