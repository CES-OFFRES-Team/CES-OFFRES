<?php

$router->put('/users/:id', function($id) {
    $controller = new UserController();
    $controller->updateUser($id);
}); 