import useUserDetailsQuery from 'queries/boardroom/useUserDetailsQuery';
import Avatar from 'components/Avatar';
import { truncateAddress } from 'utils/truncate-address';
import { ExternalLink } from '@synthetixio/ui';
import { UserSocials } from 'components/MemberCard/UserSocials';
import clsx from 'clsx';
import { DeployedModules } from 'containers/Modules';

interface UserDetailsProps {
	walletAddress: string;
	moduleInstance?: DeployedModules;
	isActive?: boolean;
}

export const UserDetails: React.FC<UserDetailsProps> = ({
	walletAddress,
	isActive,
	moduleInstance,
}) => {
	const userDetailsQuery = useUserDetailsQuery(walletAddress);

	if (!userDetailsQuery.data) return <div className="h-6 rounded bg-gray-600 w-32 animate-pulse" />;

	const member = userDetailsQuery.data;

	return (
		<div
			className={clsx('flex items-center h-full p-2', {
				'border-l': isActive,
				'border-l-primary': isActive && moduleInstance === DeployedModules.SPARTAN_COUNCIL,
				'border-l-green': isActive && moduleInstance === DeployedModules.GRANTS_COUNCIL,
				'border-l-orange': isActive && moduleInstance === DeployedModules.AMBASSADOR_COUNCIL,
				'border-l-yellow': isActive && moduleInstance === DeployedModules.TREASURY_COUNCIL,
			})}
		>
			<Avatar
				className="w-6 h-6"
				scale={3}
				width={26}
				height={26}
				walletAddress={member.address}
				url={member.pfpThumbnailUrl}
			/>

			<h5 className="tg-title-h5 capitalize ml-2">
				{member.username || truncateAddress(member.address)}
			</h5>
		</div>
	);
};

export const UserActions: React.FC<Pick<UserDetailsProps, 'walletAddress'>> = ({
	walletAddress,
}) => {
	const userDetailsQuery = useUserDetailsQuery(walletAddress);

	if (!userDetailsQuery.data) return <div className="h-6 rounded bg-gray-600 w-32 animate-pulse" />;

	const member = userDetailsQuery.data;

	return (
		<div className="flex items-center gap-1">
			<UserSocials
				discord={member.discord}
				twitter={member.twitter}
				github={member.github}
				small
				fill="var(--color-blue-light-2)"
			/>
			<ExternalLink text="View" link={`https://optimistic.etherscan.io/address/${walletAddress}`} />
		</div>
	);
};
