import { act, fireEvent, render, screen } from '@testing-library/react';
import { DeployedModules } from 'containers/Modules/Modules';
import { CouncilCard } from '.';
import enJSON from 'i18n/en.json';

const now = new Date().getTime();

const useRouterMock = jest.spyOn(require('next/router'), 'useRouter');
useRouterMock.mockImplementation(() => ({
	push: jest.fn(),
}));

const translationMock = {
	'landing-page.cards.cta.nomination': enJSON['landing-page'].cards.cta.nomination,
	'landing-page.cards.spartan': enJSON['landing-page'].cards.spartan,
	'landing-page.cards.grants': enJSON['landing-page'].cards.grants,
	'landing-page.cards.ambassador': enJSON['landing-page'].cards.ambassador,
	'landing-page.cards.treasury': enJSON['landing-page'].cards.treasury,
	'landing-page.cards.candidates': enJSON['landing-page'].cards.candidates,
	'landing-page.cards.received': enJSON['landing-page'].cards.received,
};

let latestPaths: string[] = [];

const useCouncilCardQueriesMock = jest.spyOn(require('hooks/useCouncilCardQueries'), 'default');
const modalMock = jest.spyOn(require('containers/Modal/Modal'), 'useModalContext');
modalMock.mockImplementation(() => ({
	setContent: jest.fn(),
	setIsOpen: jest.fn(),
}));
jest.mock('queries/voting/useVotingCount', () => {
	return {
		useVotingCount: () => {
			return { data: jest.fn() };
		},
	};
});
jest.mock('@apollo/client', () => {
	return { ApolloClient: jest.fn(), InMemoryCache: jest.fn() };
});
jest.mock('react-i18next', () => ({
	useTranslation() {
		return {
			t: (path: keyof typeof translationMock) => {
				latestPaths.push(path);
				return translationMock[path];
			},
		};
	},
}));
jest.mock('containers/Modules/Modules', () => ({
	DeployedModules: { SPARTAN_COUNCIL: 'spartan council' },
}));
describe('Council Card component', () => {
	afterAll(() => jest.clearAllMocks());
	afterEach(() => (latestPaths = []));
	test('Council Card component should display the correct CTA text for nomination period', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: { currentPeriod: 'NOMINATION' },
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: jest.fn(),
			};
		});
		render(
			<CouncilCard
				council="test-council"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		expect(screen.getByTestId('cta-text').textContent).toBe('NOMINATIONS OPEN');
		expect(!!latestPaths.find((path) => path === 'landing-page.cards.cta.nomination')).toBeTruthy();
	});
	test('Council Card component should display the correct headlines the provided council prop', () => {
		render(
			<>
				<CouncilCard
					council="spartan"
					deployedModule={DeployedModules.SPARTAN_COUNCIL}
					image="http://localhost:3000"
				/>{' '}
				<CouncilCard
					council="grants"
					deployedModule={DeployedModules.GRANTS_COUNCIL}
					image="http://localhost:3000"
				/>{' '}
				<CouncilCard
					council="ambassador"
					deployedModule={DeployedModules.AMBASSADOR_COUNCIL}
					image="http://localhost:3000"
				/>{' '}
				<CouncilCard
					council="treasury"
					deployedModule={DeployedModules.TREASURY_COUNCIL}
					image="http://localhost:3000"
				/>
			</>
		);
		expect(screen.getByTestId('council-headline-spartan').textContent).toBe('Spartan Council');
		expect(screen.getByTestId('council-headline-grants').textContent).toBe('Grants Council');
		expect(screen.getByTestId('council-headline-ambassador').textContent).toBe(
			'Ambassador Council'
		);
		expect(screen.getByTestId('council-headline-treasury').textContent).toBe('Treasury Council');
		expect(!!latestPaths.find((path) => path === 'landing-page.cards.spartan')).toBeTruthy();
		expect(!!latestPaths.find((path) => path === 'landing-page.cards.grants')).toBeTruthy();
		expect(!!latestPaths.find((path) => path === 'landing-page.cards.ambassador')).toBeTruthy();
		expect(!!latestPaths.find((path) => path === 'landing-page.cards.treasury')).toBeTruthy();
	});

	test('Council Card component should show the timer if the period is set to Nomination and the nomination period end time is provided', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: { currentPeriod: 'VOTING' },
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: { votingPeriodEndDate: now },
			};
		});
		render(
			<CouncilCard
				council="spartan"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		expect(!!screen.getByTestId('voting-timer')).toBeTruthy();
	});

	test('Council Card button should should route to /councils if period is not in voting or nomination', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: { currentPeriod: 'ADMINISTRATION' },
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: { votingPeriodEndDate: now },
			};
		});
		let state = { pathname: '/defaultRoute' };
		useRouterMock.mockImplementationOnce(() => {
			return { push: (route: Record<'pathname', string>) => (state = route) };
		});
		render(
			<CouncilCard
				council="spartan"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		act(() => {
			fireEvent.click(screen.getByTestId('card-button'));
		});
		expect(state.pathname).toEqual('/councils');
	});

	test('Council Card component should display loading state when councilInfo is undefined', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: jest.fn(),
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: { votingPeriodEndDate: now },
			};
		});
		render(
			<CouncilCard
				council="spartan"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		expect(!!screen.getByTestId('loading-state')).toBeTruthy();
	});
	test('Council Card component should display the correct left and right headline if in nomination period', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: { currentPeriod: 'NOMINATION' },
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: jest.fn(),
			};
		});
		render(
			<CouncilCard
				council="test-council"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		expect(screen.getByTestId('headline-left').textContent).toBe('Candidates');
		expect(screen.getByTestId('headline-right').textContent).toBe('Votes Received');
		expect(!!latestPaths.find((path) => path === 'landing-page.cards.candidates')).toBeTruthy();
		expect(!!latestPaths.find((path) => path === 'landing-page.cards.received')).toBeTruthy();
	});

	test('Council Card button should should route to /councils if period is not in voting or nomination', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: { currentPeriod: 'ADMINISTRATION' },
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: { votingPeriodEndDate: now },
			};
		});
		let state = { pathname: '/defaultRoute' };
		useRouterMock.mockImplementationOnce(() => {
			return { push: (route: Record<'pathname', string>) => (state = route) };
		});
		render(
			<CouncilCard
				council="spartan"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		act(() => {
			fireEvent.click(screen.getByTestId('card-button'));
		});
		expect(state.pathname).toEqual('/councils');
	});
	test('Council Card button should should route to /councils if period is not in voting or nomination', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: { currentPeriod: 'NOMINATION' },
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: { votingPeriodEndDate: now },
			};
		});
		const modalState = { content: false, open: false };
		modalMock.mockImplementation(() => {
			return {
				setContent: () => (modalState.content = true),
				setIsOpen: () => (modalState.open = true),
			};
		});
		render(
			<CouncilCard
				council="spartan"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		act(() => {
			fireEvent.click(screen.getByTestId('card-button'));
		});
		expect(modalState.content).toBeTruthy();
		expect(modalState.open).toBeTruthy();
	});
	test('Council Card button should should route to /councils if period is not in voting or nomination', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: { currentPeriod: 'VOTING' },
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: { votingPeriodEndDate: now },
			};
		});
		let state = '/defaultRoute';
		useRouterMock.mockImplementationOnce(() => {
			return { push: (route: string) => (state = route) };
		});
		render(
			<CouncilCard
				council="spartan"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		act(() => {
			fireEvent.click(screen.getByTestId('card-button'));
		});
		expect(state).toBe('/vote/spartan');
	});

	test('Council Card button should should route to /councils if period is not in voting or nomination', () => {
		useCouncilCardQueriesMock.mockImplementation(() => {
			return {
				councilMembers: jest.fn(),
				currentPeriodData: { currentPeriod: 'EVALUATION' },
				nominationDates: { nominationPeriodEndDate: now },
				nominees: jest.fn(),
				votingDates: { votingPeriodEndDate: now },
			};
		});
		let state = '/defaultRoute';
		useRouterMock.mockImplementationOnce(() => {
			return { push: (route: string) => (state = route) };
		});
		render(
			<CouncilCard
				council="spartan"
				deployedModule={DeployedModules.SPARTAN_COUNCIL}
				image="http://localhost:3000"
			/>
		);
		act(() => {
			fireEvent.click(screen.getByTestId('card-button'));
		});
		expect(state).toBe('/councils/spartan');
	});
});
