<?php
namespace App\Core;

/**
 * Router Class - Handles routing and dispatching
 */
class Router
{
    private $routes = [];
    private $middlewares = [];
    
    /**
     * Add GET route
     */
    public function get($path, $controller, $action, $middlewares = [])
    {
        $this->addRoute('GET', $path, $controller, $action, $middlewares);
    }
    
    /**
     * Add POST route
     */
    public function post($path, $controller, $action, $middlewares = [])
    {
        $this->addRoute('POST', $path, $controller, $action, $middlewares);
    }
    
    /**
     * Add PUT route
     */
    public function put($path, $controller, $action, $middlewares = [])
    {
        $this->addRoute('PUT', $path, $controller, $action, $middlewares);
    }
    
    /**
     * Add DELETE route
     */
    public function delete($path, $controller, $action, $middlewares = [])
    {
        $this->addRoute('DELETE', $path, $controller, $action, $middlewares);
    }
    
    /**
     * Add route to routes array
     */
    private function addRoute($method, $path, $controller, $action, $middlewares = [])
    {
        $path = '/api' . $path;
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';
        
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'pattern' => $pattern,
            'controller' => $controller,
            'action' => $action,
            'middlewares' => $middlewares,
        ];
    }
    
    /**
     * Dispatch request to appropriate controller
     */
    public function dispatch(Request $request)
    {
        $method = $request->method();
        $path = $request->path();
        
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            if (preg_match($route['pattern'], $path, $matches)) {
                // Extract route parameters
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                // Run middlewares
                foreach ($route['middlewares'] as $middleware) {
                    $middlewareInstance = new $middleware();
                    $middlewareResult = $middlewareInstance->handle($request);
                    
                    if ($middlewareResult instanceof Response) {
                        $middlewareResult->send();
                        return;
                    }
                }
                
                // Instantiate controller
                $controllerClass = $route['controller'];
                $action = $route['action'];
                
                if (!class_exists($controllerClass)) {
                    Response::json(['error' => 'Controller not found'], 500)->send();
                    return;
                }
                
                $controller = new $controllerClass();
                
                if (!method_exists($controller, $action)) {
                    Response::json(['error' => 'Action not found'], 500)->send();
                    return;
                }
                
                // Call controller action
                // Add Request as first parameter, then route parameters
                $parameters = array_merge([$request], array_values($params));
                $response = call_user_func_array([$controller, $action], $parameters);
                
                if ($response instanceof Response) {
                    $response->send();
                    return;
                }
                
                return;
            }
        }
        
        // Route not found
        Response::json(['error' => 'Route not found'], 404)->send();
    }
}

