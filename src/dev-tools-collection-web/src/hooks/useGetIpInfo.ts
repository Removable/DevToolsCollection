import { useState } from 'react';

const fetchIpInfo = async (ip?: string): Promise<IPInfo | null> => {
	try {
		const finalIp = ip || 'what-is-my-ip';
		const response = await fetch(`https://ipinfo.io/${finalIp}`);
		const htmlString = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlString, 'text/html');

		// Actual IP
		const actualIp = doc.querySelector('h1.leading-none')?.textContent;

		const ipInfoTableRows = doc.querySelectorAll(
			'table.table-striped tbody tr'
		);
		//ASN
		const firstRow = ipInfoTableRows?.[0];
		const asn = firstRow?.querySelector('td:nth-child(2)')?.textContent;
		//Range
		const thirdRow = ipInfoTableRows?.[2];
		const range = thirdRow?.querySelector('td:nth-child(2)')?.textContent;
		//Company
		const fourthRow = ipInfoTableRows?.[3];
		const company = fourthRow?.querySelector('td:nth-child(2)')?.textContent;
		//Privacy
		const sixthRow = ipInfoTableRows?.[5];
		const privacy =
			sixthRow?.querySelector('td:nth-child(2)')?.textContent?.trim() ===
			'True';
		//Anycast
		const seventhRow = ipInfoTableRows?.[6];
		const anycast = seventhRow?.querySelector('td:nth-child(2)')?.textContent;
		//ASN Type
		const eighthRow = ipInfoTableRows?.[7];
		const asnType = eighthRow?.querySelector('td:nth-child(2)')?.textContent;
		//Abuse contact
		const ninthRow = ipInfoTableRows?.[8];
		const abuseContact =
			ninthRow?.querySelector('td:nth-child(2)')?.textContent?.trim() ||
			'未提供';

		// Location
		const locationTableRows = doc.querySelectorAll('table.geo-table tbody tr');
		// City
		const cityRow = locationTableRows?.[0];
		const city = cityRow?.querySelector('td:nth-child(2)')?.textContent;
		// State
		const stateRow = locationTableRows?.[1];
		const state = stateRow?.querySelector('td:nth-child(2)')?.textContent;
		// Country
		const countryRow = locationTableRows?.[2];
		const country = countryRow?.querySelector('td:nth-child(2)')?.textContent;
		// Local Time
		const localTimeRow = locationTableRows?.[4];
		const localTime =
			localTimeRow?.querySelector('td:nth-child(2)')?.textContent;
		// Timezone
		const timezoneRow = locationTableRows?.[5];
		const timezone = timezoneRow?.querySelector('td:nth-child(2)')?.textContent;
		// Coordinates
		const coordinatesRow = locationTableRows?.[3];
		const coordinates =
			coordinatesRow?.querySelector('td:nth-child(2)')?.textContent;

		return {
			asn: asn || '未知',
			abuseContact: abuseContact || '未提供',
			anycast: anycast?.trim() === 'True',
			asnType: asnType || '未知',
			company: company || '未知',
			privacy: privacy,
			range: range || '未知',
			time: {
				localTime: localTime || '未知',
				timezone: timezone || '未知'
			},
			location: {
				city: city || '未知',
				coordinates: coordinates || '未知',
				country: country || '未知',
				state: state || '未知'
			},
			ip: actualIp || '未知'
		};
	} catch (error) {
		console.error('Error fetching IP info:', error);
		return null;
	}
};

export default function useGetIpInfo() {
	const [loading, setLoading] = useState<boolean>(false);

	const getIpInfo = async (ip?: string): Promise<IPInfo | null> => {
		setLoading(true);
		const info = await fetchIpInfo(ip);
		setLoading(false);

		return info;
	};

	return {
		loading,
		getIpInfo
	};
}

// Types
interface IPInfo {
	ip: string;
	asn: string;
	range: string;
	company: string;
	privacy: boolean;
	anycast: boolean;
	asnType: string;
	abuseContact: string;
	location: {
		city: string;
		state: string;
		country: string;
		coordinates: string;
	};
	time: {
		localTime: string;
		timezone: string;
	};
}

export type { IPInfo };
