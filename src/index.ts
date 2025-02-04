import { OAuth2Client, OAuth2RequestError, OAuth2Tokens } from "arctic";
import {Strategy} from "remix-auth/strategy";
import { redirect } from "./utils/redirect-function.js";



type URLConstructorType = ConstructorParameters<typeof URL>[0];

/**
 * A custom class that extends the Strategy class from the {@link https://github.com/sergiodxa/remix-auth} to make it easier to implement google auth.
 * @class Strategy
 */

export class GoogleOAuth2Strategy<User> extends Strategy<User, GoogleOAuth2Strategy.VerifyOptions> {

    /**
	 * the name of the strategy that is using the Strategy class from the remix-auth package.
     * This is used to specify the name when using the Authenticator.use() method
     * @example
     * const authenticator = new Authenticator<User>();
     * autheticator.use(new GoogleOAuth2Strategy(), "google")
	 * @public
	 */
    override name = "google"

    /**
     * the client that is generated from the credentials from google
     * @protected
     */
    protected client: OAuth2Client

    constructor(
        protected options: GoogleOAuth2Strategy.ConstructorPayload,
        verify: Strategy.VerifyFunction<User, GoogleOAuth2Strategy.VerifyOptions>
    ){
        super(verify);
        this.client = new OAuth2Client(
            options.clientId,
            options.clientSecret,
            options.redirectUri.toString()
        );

    }

    override async authenticate(request: Request): Promise<User> {
        const url = new URL(request.url);

        const stateUrl = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        const code = url.searchParams.get("code");

        // if there is an error throw this error
        if(error) {
            const description = url.searchParams.get("error_description");
            const uri = url.searchParams.get("error_uri");
            throw new OAuth2RequestError(error, description, uri, stateUrl);
        }

        if(!stateUrl) {
            const {state, codeVerifier, url} = this.createAuthorizationURL();

            // add custom parameters to the URL, e.g from the request
            url.search = this.authorizationParams(url.searchparams).toString();

            //redirect the user to the auth url
            throw redirect(String(url), {
                headers: {
                    "Set-Cookie": 
                }
            })
        }
    }

}


export namespace GoogleOAuth2Strategy {
    export interface ConstructorPayload {

        /**
         * the client ID of the google application created on the console
         */
        clientId: string;
        /**
         * the client secret of the google application created on the console
         */
        clientSecret: string;

        /** 
         * the auth endpoint that google uses to let users log in e.g through a prompt window where they have to select the account to log in with
         */

        authEndpoint: URLConstructorType

        /** 
         * the token endpoint that google uses to exchange the user's authorization code for an access token and/or refresh token
         */

        tokenEndpoint: URLConstructorType


        /**
         * * The URL of your application where Google will redirect the
		 * user after being logged in or authorized.
         */
        redirectUri: URLConstructorType

        /**
         * the endpoint to revoke tokens with google
         */

        revokeTokenEndpoint?: URLConstructorType


        /**
         * scopes the define the access level you want for a given user.
         * It is an array of scope strings e.g ["openid", "email"]
         */
        scopes?:string[]

    }

    export interface VerifyOptions {
        /** the request that is responsible for the auth flow with google */
        request: Request;

        /** the tokens received from google, i.e access and refresh tokens */
        tokens: OAuth2Tokens
    }
}