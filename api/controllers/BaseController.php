<?php
class BaseController {
    protected function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }

    protected function getRequestData() {
        $data = json_decode(file_get_contents('php://input'), true);
        return $data;
    }

    protected function validateRequest($requiredFields) {
        $data = $this->getRequestData();
        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $missingFields[] = $field;
            }
        }

        if (!empty($missingFields)) {
            $this->sendResponse([
                'error' => 'Missing required fields',
                'fields' => $missingFields
            ], 400);
        }

        return $data;
    }
} 