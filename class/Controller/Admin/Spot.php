<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Spot as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Spot extends Base
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
        $response = new \Canopy\Response($view);

        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        switch ($request->getVar('command')) {
            case 'reserve':
                $factory->reserve(filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT), filter_input(INPUT_POST, 'reserved', FILTER_SANITIZE_NUMBER_INT));
                break;
            
            case 'sober':
                $factory->sober(filter_input(INPUT_POST, 'id', FILTER_SANITIZE_NUMBER_INT), filter_input(INPUT_POST, 'sober', FILTER_SANITIZE_NUMBER_INT));
                break;
        }
        return $response;
    }

}
