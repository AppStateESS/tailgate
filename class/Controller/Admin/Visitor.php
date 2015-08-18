<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Visitor as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends \Http\Controller
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

        switch ($command) {
            case 'list':
                return $this->visitorList();
        }
    }

    private function visitorList()
    {
        $listing = Factory::getList();
        $view = new \View\JsonView($listing);
        return $view;
    }

    public function post(\Request $request)
    {
        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        switch ($request->getVar('command')) {
            case 'add':
                $this->add();
                exit;

            case 'remove':
                $this->remove($request);
                $view = new \View\JsonView(array('success' => true));
                $response = new \Response($view);
                return $response;
                exit;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
    }

    private function add()
    {
        $university = filter_input(INPUT_POST, 'university', FILTER_SANITIZE_STRING);
        $mascot = filter_input(INPUT_POST, 'mascot', FILTER_SANITIZE_STRING);

        $visitor = new \tailgate\Resource\Visitor;

        $visitor->setUniversity($university);
        $visitor->setMascot($mascot);

        Factory::save($visitor);
    }

    private function remove(\Request $request)
    {
        $id = $request->getVar('visitor_id');
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_visitor');
        $tbl->addFieldConditional('id', $id);
        $db->delete();
    }

}
