<?php
require_once 'models/User.php';

class UserController extends BaseController {
    private $user;
    private $database;

    public function __construct() {
        $this->database = new Database();
        $db = $this->database->getConnection();
        $this->user = new User($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        switch ($method) {
            case 'GET':
                $this->getUsers();
                break;
            case 'POST':
                $this->createUser();
                break;
            default:
                $this->sendResponse(['error' => 'Method not allowed'], 405);
        }
    }

    private function getUsers() {
        $stmt = $this->user->read();
        $users = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $user_item = [
                "id" => $id,
                "name" => $name,
                "email" => $email
            ];
            array_push($users, $user_item);
        }

        $this->sendResponse($users);
    }

    private function createUser() {
        $data = $this->validateRequest(['name', 'email', 'password']);

        $this->user->name = $data['name'];
        $this->user->email = $data['email'];
        $this->user->password = $data['password'];

        if($this->user->create()) {
            $this->sendResponse([
                "message" => "User was created."
            ], 201);
        } else {
            $this->sendResponse([
                "message" => "Unable to create user."
            ], 503);
        }
    }
} 