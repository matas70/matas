class ARButton {

	static createButton( renderer, sessionInit = {} ) {

		const button = document.createElement( 'button' );
		
		function showStartAR( /*device*/ ) {

			if ( sessionInit.domOverlay === undefined ) {

				var overlay = document.createElement( 'div' );
				overlay.style.display = 'none';
				document.body.appendChild( overlay );

				var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
				svg.setAttribute( 'width', 38 );
				svg.setAttribute( 'height', 38 );
				svg.style.position = 'absolute';
				svg.style.right = '20px';
				svg.style.top = '20px';
				svg.addEventListener( 'click', function () {

					currentSession.end();

				} );
				overlay.appendChild( svg );

				var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
				path.setAttribute( 'd', 'M 12,12 L 28,28 M 28,12 12,28' );
				path.setAttribute( 'stroke', '#fff' );
				path.setAttribute( 'stroke-width', 2 );
				svg.appendChild( path );

				if ( sessionInit.optionalFeatures === undefined ) {

					sessionInit.optionalFeatures = [];

				}

				sessionInit.optionalFeatures.push( 'dom-overlay' );
				sessionInit.domOverlay = { root: overlay };

			}

			//

			let currentSession = null;

			async function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				renderer.xr.setReferenceSpaceType( 'local' );

				await renderer.xr.setSession( session );
			
				sessionInit.domOverlay.root.style.display = '';
				sessionInit.domOverlay.root.classList.add('show');
				sessionInit.domOverlay.root.style.opacity = '1';
				
				currentSession = session;

			}

			
			function onSessionEnded( /*event*/ ) {

				// if(sessionInit.endSessionCallback) {
				// 	sessionInit.endSessionCallback()
				// }
				if(currentSession){
					currentSession.removeEventListener( 'end', onSessionEnded );
				}
				openFullscreen(document.documentElement);
				//button.textContent = 'להתחיל תלת מימד';
				//button.style.backgroundImage = url('/icons/ar.svg');
				//sessionInit.domOverlay.root.style.display = 'none';

				currentSession = null;

			}

			//

			button.style.display = '';

			//button.textContent = 'להתחיל תלת מימד';

			button.onmouseenter = function () {

				button.style.opacity = '1.0';

			};

			// button.onmouseleave = function () {

			// 	button.style.opacity = '0.5';

			// };

			// button.onclick = function () {
			// 	debugger
			// 	if ( currentSession === null ) {

			// 		navigator.xr.requestSession( 'immersive-ar', sessionInit ).then( onSessionStarted );

			// 	} else {

			// 		currentSession.end();

			// 	}

			// };
			
			button.onclick = async function () {
				
				try {
					if ( currentSession === null ) {
						await navigator.xr.requestSession('immersive-ar', sessionInit).then(onSessionStarted);
						sessionInit.animate();

					}else{
						currentSession.end();
						currentSession = null;
					}
				} catch (e) {
					if(sessionInit.fallback) {
						sessionInit.fallback();
					}
				}

			};

			
		}
		function openFullscreen(elem) {
			if (elem.requestFullscreen) {
			  elem.requestFullscreen();
			} else if (elem.webkitRequestFullscreen) { /* Safari */
			  elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) { /* IE11 */
			  elem.msRequestFullscreen();
			}
		  }

		function disableButton() {

			button.style.display = '';

			button.style.cursor = 'auto';
			button.style.left = 'calc(50% - 75px)';
			button.style.width = '150px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

		}

		function showARNotSupported() {

			disableButton();

			button.textContent = 'AR NOT SUPPORTED';

		}

		function stylizeElement( element ) {

	


		}

		if ( 'xr' in navigator ) {

			button.id = 'ARButton';
			//button.style.display = 'none';

			stylizeElement( button );

			navigator.xr.isSessionSupported( 'immersive-ar' ).then( function ( supported ) {

				supported ? showStartAR() : showARNotSupported();

			} ).catch( showARNotSupported );

			return button;

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message

			} else {

				// message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement( message );

			return message;

		}

	}

}

export { ARButton };