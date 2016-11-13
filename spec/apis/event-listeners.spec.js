export function notStartedEventListeners() {
	describe(`event listeners before single-spa is started :`, () => {
		beforeEach(ensureCleanSlate)
		
		it(`calls hashchange and popstate event listeners even when single-spa is not started`, done => {
			let hashchangeCalled = false, popstateCalled = false;
			window.addEventListener("hashchange", () => {
				if (window.location.hash === '#/a-new-hash')
					hashchangeCalled = true;
			});
			window.addEventListener("popstate", () => {
				if (window.location.hash === '#/a-new-hash')
					popstateCalled = true;
			});

			window.location.hash = '#/a-new-hash';
			setTimeout(() => {
				expect(hashchangeCalled).toBe(true);
				// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/3740423/
				if (isntIEOrEdge()) {
					expect(popstateCalled).toBe(true);
				}
				done();
			}, 20);
		});
	});
}

export function yesStartedEventListeners() {
	describe(`event listeners after single-spa is started`, () => {
		beforeEach(ensureCleanSlate);

		it(`calls all of the enqueued hashchange listeners even when the first event given to singleSpa is a popstate event`, done => {
			let hashchangeCalled = false, popstateCalled = false;

			window.addEventListener("hashchange", () => {
				hashchangeCalled = true;
			});
			window.addEventListener("popstate", () => {
				popstateCalled = true;
			});

			/* This will first trigger a PopStateEvent, and then a HashChangeEvent. The
			 * hashchange event will be queued and not actually given to any event listeners
			 * until single-spa is sure that those event listeners won't screw anything up.
			 * The bug described in https://github.com/CanopyTax/single-spa/issues/74 explains
			 * why this test is necessary.
			 */
			window.location.hash = '#/a-hash-single-spa-is-started';
			setTimeout(() => {
				expect(hashchangeCalled).toBe(true);
				// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/3740423/
				if (isntIEOrEdge()) {
					expect(popstateCalled).toBe(true);
				}
				done();
			}, 20);
		});
	});
}


function ensureCleanSlate(done) {
	/* First we need to make sure we have a clean slate where single-spa is not queueing up events or app changes.
	 * Otherwise, the event listeners might be called because of a different spec that causes hashchange and popstate
	 * events
	 */
	singleSpa
	.triggerAppChange()
	.then(done)
	.catch(err => {
		fail(err);
		done();
	});
}

function isntIEOrEdge() {
	return navigator.userAgent.indexOf('MSIE') < 0 && !(/Trident.*rv[ :]*11\./.test(navigator.userAgent)) && !(/Edge\/\d./i.test(navigator.userAgent));
}