<?php

namespace tailgate\Controller\Admin;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
abstract class Base extends \Http\Controller
{

    public function get(\Canopy\Request $request)
    {
        $data = array();
        $view = $this->getView($data, $request);
        $response = new \Canopy\Response($view);
        return $response;
    }

    public function getHtmlView($data, \Canopy\Request $request)
    {
        \Layout::addStyle('tailgate', 'Admin/Setup/style.css');
        javascript('datetimepicker');
        javascript('ckeditor');
        javascript('jquery');

        $script = \tailgate\Factory\React::load('setup', REACT_DEVMODE);
        $content = <<<EOF
<h2>Tailgate</h2>
<div id="tailgate-setup"></div>
$script
EOF;
        $view = new \View\HtmlView($content);
        return $view;
    }

    protected function deactivate($factory, $id)
    {
        $factory->deactivate($id);
        $view = new \View\JsonView(array('success' => true));
        $response = new \Canopy\Response($view);
        return $response;
    }

}
