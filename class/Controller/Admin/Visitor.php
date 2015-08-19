<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Visitor as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends Base
{

    public function get(\Request $request)
    {
        $data = array();
        $view = $this->getView($data, $request);
        $response = new \Response($view);
        return $response;
    }

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'list':
                return $this->getList($factory, TG_LIST_ACTIVE, 'university');
        }
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
            case 'add':
                $factory->postNew();
                return $response;

            case 'deactivate':
                $factory->deactivate($request->getVar('visitor_id'));
                return $response;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
    }

}
