<?php

namespace tailgate\Controller\Admin;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
abstract class Base extends \Http\Controller
{

    protected function getList($factory, $active_state = TG_LIST_ACTIVE, $sort_by=null)
    {
        $listing = $factory->getList($active_state, $sort_by);
        $view = new \View\JsonView($listing);
        return $view;
    }

    protected function deactivate($factory, $id)
    {
        $factory->deactivate($id);
        $view = new \View\JsonView(array('success' => true));
        $response = new \Response($view);
        return $response;
    }

}
