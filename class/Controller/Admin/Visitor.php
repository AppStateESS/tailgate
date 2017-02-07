<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Visitor as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends Base
{

    protected function getJsonView($data, \Canopy\Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'list':
                $json = $factory->getList(TG_LIST_ACTIVE, 'university');
                break;
        }
        $view = new \View\JsonView($json);
        return $view;
    }

    public function post(\Canopy\Request $request)
    {
        $factory = new Factory;
        $view = new \View\JsonView(array('success' => true));
        $response = new \Canopy\Response($view);

        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        switch ($request->getVar('command')) {
            case 'add':
                $factory->postNew();
                break;

            case 'deactivate':
                $factory->deactivate($request->getVar('visitor_id'));
                break;

            case 'update':
                $this->update();
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
        return $response;
    }
    
    private function update()
    {
        $visitor_id = filter_input(INPUT_POST, 'visitorId', FILTER_SANITIZE_NUMBER_INT);
        $university = filter_input(INPUT_POST, 'university', FILTER_SANITIZE_STRING);
        $mascot = filter_input(INPUT_POST, 'mascot', FILTER_SANITIZE_STRING);
        
        $visitor = Factory::getById($visitor_id);
        $visitor->setUniversity($university);
        $visitor->setMascot($mascot);
        Factory::saveResource($visitor);
    }

}
