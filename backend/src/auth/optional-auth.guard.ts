import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional Authentication Guard
 * 
 * Allows requests to pass through without authentication (for guest users)
 * but validates JWT tokens when they are present.
 * 
 * Use this guard for endpoints that should support both:
 * - Guest users (no token required)
 * - Authenticated users (token validated if present)
 * 
 * Example use cases:
 * - AI chart generation (works for both guest and authenticated users)
 * - Creating charts (guests can create, but won't be saved to history)
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
    /**
     * Override handleRequest to make authentication optional
     * Returns user if token is valid, null if no token or invalid token
     */
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        // If there's a valid user from JWT strategy, return it
        if (user) {
            return user;
        }

        // No user means either:
        // 1. No token provided (guest user) - this is OK
        // 2. Invalid token - this is also OK for optional auth
        // We return null and let the controller handle guest vs authenticated logic
        return null;
    }

    /**
     * Always return true to allow the request to continue
     * The controller will check if req.user exists to determine if authenticated
     */
    canActivate(context: ExecutionContext) {
        // Call parent's canActivate but catch any errors
        return super.canActivate(context) as Promise<boolean> | boolean;
    }
}
