#!/usr/bin/php
<?php
if (!isset($_SERVER['argv'])) {
    exit;
}
define('STUDENT_LIMIT', 100);
define('DB_DSN', 'mysql:host=localhost;dbname=phpwebsite');
define('DB_USERNAME', 'dbuser');
define('DB_PASSWORD', 'dbpass');

createRows();


/* functions below */
function getFirstNames()
{
    static $first_names = array(
        "Yasmine",
        "Margurite",
        "Mauro",
        "Cecile",
        "Rubye",
        "Bethany",
        "Valentine",
        "Eryn",
        "Harvey",
        "Samella",
        "Rheba",
        "Johnie",
        "Ingrid",
        "Inger",
        "Celestina",
        "Lea",
        "Randa",
        "Tonda",
        "Jene",
        "Autumn",
        "Brynn",
        "Tresa",
        "Roselia",
        "Billye",
        "Tory",
        "German",
        "Carisa",
        "Faith",
        "Dwayne",
        "Marivel",
        "Paola",
        "Emeline",
        "Mazie",
        "Suanne",
        "Latoria",
        "Andre",
        "Celine",
        "Claudie",
        "Tonie",
        "Kelsi",
        "Mertie",
        "Luigi",
        "Thalia",
        "Crissy",
        "Natosha",
        "Josefine",
        "Daisy",
        "Odessa",
        "Lorette",
        "Sunny"
    );
    return $first_names;
}

function getLastNames()
{
    static $last_names = array(
        "Applebome",
        "Avant",
        "Badash",
        "Bailyn",
        "Beatrice",
        "Bielli",
        "Birindelli",
        "Candelaria",
        "Chambers",
        "Da silva",
        "Divola",
        "Dominguez",
        "Dresser",
        "Dupree",
        "Fachin",
        "Frederick",
        "Geeve",
        "Gildea",
        "Gualandi",
        "Gunning",
        "Horrell",
        "Hughes",
        "Hutson",
        "Imai",
        "Ith",
        "Jutras",
        "Kass",
        "Kemmerer",
        "Kolb",
        "Lehrhaupt",
        "Linzee",
        "Manocchia",
        "Mayer",
        "Mcmullen",
        "Mello",
        "Mignani",
        "Murnane",
        "Pinter",
        "Polimou",
        "Pollack",
        "Popiel",
        "Repetto",
        "Richards",
        "Schnetz",
        "Shuer",
        "Swarbrick",
        "Tooby",
        "Tsuang",
        "Wynne"
    );
    return $last_names;
}

function createRows()
{
    $dbh = new PDO(DB_DSN, DB_USERNAME, DB_PASSWORD);
    $user_insert = <<<EOF
insert into users 
    (id, active, approved, username, display_name, email) 
    values
    (:id, 1, 1, :username, :full_name, :email)
EOF;

    $user_stmt = $dbh->prepare($user_insert);
    $user_stmt->bindParam(':id', $user_id);
    $user_stmt->bindParam(':username', $username);
    $user_stmt->bindParam(':full_name', $full_name);
    $user_stmt->bindParam(':email', $email);
    
    $group_insert = <<<EOF
insert into users_groups 
    (id, active, name, user_id) 
    values
    (:id, 1, :username, :user_id)
EOF;
    $group_stmt = $dbh->prepare($group_insert);
    $group_stmt->bindParam(':id', $group_id);
    $group_stmt->bindParam(':username', $username);
    $group_stmt->bindParam(':user_id', $user_id);
    
    $student_insert = <<<EOF
insert into tg_student
    (user_id, first_name, last_name)
    values
    (:user_id, :first_name, :last_name)        
EOF;
    $student_stmt = $dbh->prepare($student_insert);
    $student_stmt->bindParam(':user_id', $user_id);
    $student_stmt->bindParam(':first_name', $first_name);
    $student_stmt->bindParam(':last_name', $last_name);
    
    $user_id_result = $dbh->query('select id from users_seq', PDO::FETCH_ASSOC);
    $lastUserId = $user_id_result->fetchColumn();

    $group_id_result = $dbh->query('select id from users_groups_seq', PDO::FETCH_ASSOC);
    $lastGroupId = $group_id_result->fetchColumn();
    
    for ($i = 1; $i <= STUDENT_LIMIT; $i++) {
        $user_id = $lastUserId + $i;
        $group_id = $lastGroupId + $i;
        $first_name = getName(1);
        $last_name = getName(2);
        $full_name = "$first_name $last_name";
        $username = makeUsername($first_name, $last_name);
        $email = $username . '@appstate.edu';
        $user_stmt->execute();
        $group_stmt->execute();
        $student_stmt->execute();
        echo "Created user $username\n";
    }
    $user_seq_stmt = 'update users_seq set id=' . $user_id;
    $dbh->exec($user_seq_stmt);
    $group_seq_stmt = 'update users_groups_seq set id=' . $group_id;
    $dbh->exec($group_seq_stmt);
}

function getName($place)
{
    if ($place === 1) {
        $names = getFirstNames();
    } else {
        $names = getLastNames();
    }

    return $names[array_rand($names)];
}

function makeUsername($first, $last)
{
    static $used_names = array();

    $last_portion = substr($last, 0, 6);
    $first_portion = substr($first, 0, 2);
    $username = str_replace(' ', '', strtolower($last_portion . $first_portion));
    if (in_array($username, $used_names)) {
        for ($i = 1; $i < 50; $i++) {
            $test = $username += $i;
            if (!in_array($test, $used_names)) {
                $username = $test;
                break;
            }
        }
    }
    return $username;
}
