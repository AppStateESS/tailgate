<?php

function tailgate_update(&$content, $currentVersion)
{
    switch ($currentVersion) {
        case (version_compare($currentVersion, '1.1.0', '<')):
            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_student');
            $column = $tbl->getDataType('user_id');
            $unique = new \phpws2\Database\Unique($column);
            $unique->add();
            $content[] = <<<EOF
<pre>
    +added unique index to user_id in tg_student
    +safety checks added
</pre>
EOF;
    }
    return true;
}
