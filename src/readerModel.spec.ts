import camelcaseKeys = require('camelcase-keys');
import { cloneDeep } from 'lodash';
import mmdb = require('maxmind');
import * as anonymousIPFixture from '../fixtures/anonymous-ip.json';
import * as connectionTypeFixture from '../fixtures/geoip2-connection-type.json';
import * as domainFixture from '../fixtures/geoip2-domain.json';
import * as ispFixture from '../fixtures/geoip2-isp.json';
import * as geoip2Fixture from '../fixtures/geoip2.json';
import * as asnFixture from '../fixtures/geolite2-asn.json';
import { AddressNotFoundError, BadMethodCallError } from './errors';
import ReaderModel from './readerModel';

const createMmdbReaderMock = (databaseType: string, fixture: any) => ({
  get(ipAddress: string) {
    if (ipAddress === 'fail.fail') {
      return null;
    }

    if (ipAddress === 'empty') {
      return {};
    }
    return fixture;
  },
  metadata: {
    binaryFormatMajorVersion: 1,
    binaryFormatMinorVersion: 2,
    buildEpoch: new Date(),
    databaseType,
    description: 'hello',
    ipVersion: 5,
    languages: ['en'],
    nodeByteSize: 1,
    nodeCount: 1,
    recordSize: 1,
    searchTreeSize: 1,
    treeDepth: 1,
  },
});

describe('ReaderModel', () => {
  const emptyTraits = {
    ipAddress: 'empty',
    isAnonymous: false,
    isAnonymousProxy: false,
    isAnonymousVpn: false,
    isHostingProvider: false,
    isLegitimateProxy: false,
    isPublicProxy: false,
    isSatelliteProvider: false,
    isTorExitNode: false,
  };

  describe('city()', () => {
    const testFixture = {
      city: geoip2Fixture.city,
      continent: geoip2Fixture.continent as mmdb.ContinentRecord,
      country: geoip2Fixture.country,
      location: geoip2Fixture.location,
      maxmind: geoip2Fixture.maxmind,
      postal: geoip2Fixture.postal,
      registered_country: geoip2Fixture.registered_country,
      represented_country: geoip2Fixture.represented_country,
      subdivisions: geoip2Fixture.subdivisions,
      traits: geoip2Fixture.traits as mmdb.TraitsRecord,
    };

    const mmdbReader = createMmdbReaderMock(
      'GeoIP2-City-Super-Special',
      testFixture
    );

    it('returns city data', () => {
      const cityInstance = new ReaderModel(mmdbReader);
      expect(cityInstance.city('123.123')).toEqual(
        camelcaseKeys(testFixture, { deep: true, exclude: [/\-/] })
      );
      expect(cityInstance.city('123.123').traits.ipAddress).toEqual('123.123');
    });

    it('throws an error if db types do not match', () => {
      const errReader = cloneDeep(mmdbReader);
      errReader.metadata.databaseType = 'foo';

      const cityInstance = new ReaderModel(errReader);
      expect(() => cityInstance.city('123.123')).toThrow(BadMethodCallError);
    });

    it('throws an error if IP address is not in database', () => {
      const cityInstance = new ReaderModel(mmdbReader);
      expect(() => cityInstance.city('fail.fail')).toThrow(
        AddressNotFoundError
      );
    });

    it('returns empty objects/arrays', () => {
      const cityInstance = new ReaderModel(mmdbReader);
      const expected = {
        city: {},
        continent: {},
        country: {},
        location: {},
        maxmind: {},
        postal: {},
        registeredCountry: {},
        representedCountry: {},
        subdivisions: [],
        traits: emptyTraits,
      };

      expect(cityInstance.city('empty')).toEqual(expected);
    });
  });

  describe('country()', () => {
    const testFixture = {
      continent: geoip2Fixture.continent as mmdb.ContinentRecord,
      country: geoip2Fixture.country,
      maxmind: geoip2Fixture.maxmind,
      registered_country: geoip2Fixture.registered_country,
      represented_country: geoip2Fixture.represented_country,
      traits: geoip2Fixture.traits as mmdb.TraitsRecord,
    };

    const mmdbReader = createMmdbReaderMock(
      'GeoIP2-Country-Super-Special',
      testFixture
    );

    it('returns city data', () => {
      const countryInstance = new ReaderModel(mmdbReader);
      expect(countryInstance.country('123.123')).toEqual(
        camelcaseKeys(testFixture, { deep: true, exclude: [/\-/] })
      );
      expect(countryInstance.country('123.123').traits.ipAddress).toEqual(
        '123.123'
      );
    });

    it('throws an error if db types do not match', () => {
      const errReader = cloneDeep(mmdbReader);
      errReader.metadata.databaseType = 'foo';

      const countryInstance = new ReaderModel(errReader);
      expect(() => countryInstance.country('123.123')).toThrow(
        BadMethodCallError
      );
    });

    it('throws an error if IP address is not in database', () => {
      const countryInstance = new ReaderModel(mmdbReader);
      expect(() => countryInstance.country('fail.fail')).toThrow(
        AddressNotFoundError
      );
    });

    it('returns empty objects/arrays', () => {
      const countryInstance = new ReaderModel(mmdbReader);
      const expected = {
        continent: {},
        country: {},
        maxmind: {},
        registeredCountry: {},
        representedCountry: {},
        traits: emptyTraits,
      };

      expect(countryInstance.country('empty')).toEqual(expected);
    });
  });

  describe('anonymousIP()', () => {
    const mmdbReader = createMmdbReaderMock(
      'GeoIP2-Anonymous-IP',
      anonymousIPFixture
    );

    it('returns anonymousIP data', () => {
      const anonymousIPInstance = new ReaderModel(mmdbReader);
      expect(anonymousIPInstance.anonymousIP('123.123')).toEqual(
        camelcaseKeys(anonymousIPFixture)
      );
      expect(anonymousIPInstance.anonymousIP('123.123').ipAddress).toEqual(
        '123.123'
      );
    });

    it('throws an error if db types do not match', () => {
      const errReader = cloneDeep(mmdbReader);
      errReader.metadata.databaseType = 'foo';

      const anonymousIPInstance = new ReaderModel(errReader);
      expect(() => anonymousIPInstance.anonymousIP('123.123')).toThrow(
        BadMethodCallError
      );
    });

    it('throws an error if IP address is not in database', () => {
      const anonymousIPInstance = new ReaderModel(mmdbReader);
      expect(() => anonymousIPInstance.anonymousIP('fail.fail')).toThrow(
        AddressNotFoundError
      );
    });

    it('returns false for undefined values', () => {
      const anonymousIPInstance = new ReaderModel(mmdbReader);
      const expected = {
        ipAddress: 'empty',
        isAnonymous: false,
        isAnonymousVpn: false,
        isHostingProvider: false,
        isPublicProxy: false,
        isTorExitNode: false,
      };

      expect(anonymousIPInstance.anonymousIP('empty')).toEqual(expected);
    });
  });

  describe('asn()', () => {
    const mmdbReader = createMmdbReaderMock('GeoLite2-ASN', asnFixture);

    it('returns asn data', () => {
      const asnInstance = new ReaderModel(mmdbReader);
      expect(asnInstance.asn('123.123')).toEqual(camelcaseKeys(asnFixture));
      expect(asnInstance.asn('123.123').ipAddress).toEqual('123.123');
    });

    it('throws an error if db types do not match', () => {
      const errReader = cloneDeep(mmdbReader);
      errReader.metadata.databaseType = 'foo';

      const asnInstance = new ReaderModel(errReader);
      expect(() => asnInstance.asn('123.123')).toThrow(BadMethodCallError);
    });

    it('throws an error if IP address is not in database', () => {
      const asnInstance = new ReaderModel(mmdbReader);
      expect(() => asnInstance.asn('fail.fail')).toThrow(AddressNotFoundError);
    });

    it('returns empty objects/arrays', () => {
      const asnInstance = new ReaderModel(mmdbReader);
      const expected = {
        ipAddress: 'empty',
      };

      expect(asnInstance.asn('empty')).toEqual(expected);
    });
  });

  describe('connectionType()', () => {
    const mmdbReader = createMmdbReaderMock(
      'GeoIP2-Connection-Type',
      connectionTypeFixture
    );

    it('returns connection-type data', () => {
      const connectionTypeInstance = new ReaderModel(mmdbReader);
      expect(connectionTypeInstance.connectionType('123.123')).toEqual(
        camelcaseKeys(connectionTypeFixture)
      );
      expect(
        connectionTypeInstance.connectionType('123.123').ipAddress
      ).toEqual('123.123');
    });

    it('throws an error if db types do not match', () => {
      const errReader = cloneDeep(mmdbReader);
      errReader.metadata.databaseType = 'foo';

      const connectionTypeInstance = new ReaderModel(errReader);
      expect(() => connectionTypeInstance.connectionType('123.123')).toThrow(
        BadMethodCallError
      );
    });

    it('throws an error if IP address is not in database', () => {
      const connectionTypeInstance = new ReaderModel(mmdbReader);
      expect(() => connectionTypeInstance.connectionType('fail.fail')).toThrow(
        AddressNotFoundError
      );
    });

    it('returns empty objects/arrays', () => {
      const connectionTypeInstance = new ReaderModel(mmdbReader);
      const expected = {
        ipAddress: 'empty',
      };

      expect(connectionTypeInstance.connectionType('empty')).toEqual(expected);
    });
  });

  describe('enterprise()', () => {
    const testFixture = {
      city: geoip2Fixture.city,
      continent: geoip2Fixture.continent as mmdb.ContinentRecord,
      country: geoip2Fixture.country,
      location: geoip2Fixture.location,
      maxmind: geoip2Fixture.maxmind,
      postal: geoip2Fixture.postal,
      registered_country: geoip2Fixture.registered_country,
      represented_country: geoip2Fixture.represented_country,
      subdivisions: geoip2Fixture.subdivisions,
      traits: geoip2Fixture.traits as mmdb.TraitsRecord,
    };

    const mmdbReader = createMmdbReaderMock(
      'GeoIP2-Enterprise-Super-Special',
      testFixture
    );

    it('returns enterprise data', () => {
      const enterpriseInstance = new ReaderModel(mmdbReader);
      expect(enterpriseInstance.enterprise('123.123')).toEqual(
        camelcaseKeys(testFixture, { deep: true, exclude: [/\-/] })
      );
      expect(enterpriseInstance.enterprise('123.123').traits.ipAddress).toEqual(
        '123.123'
      );
    });

    it('throws an error if db types do not match', () => {
      const errReader = cloneDeep(mmdbReader);
      errReader.metadata.databaseType = 'foo';

      const enterpriseInstance = new ReaderModel(errReader);
      expect(() => enterpriseInstance.enterprise('123.123')).toThrow(
        BadMethodCallError
      );
    });

    it('throws an error if IP address is not in database', () => {
      const enterpriseInstance = new ReaderModel(mmdbReader);
      expect(() => enterpriseInstance.enterprise('fail.fail')).toThrow(
        AddressNotFoundError
      );
    });

    it('returns empty objects/arrays', () => {
      const enterpriseInstance = new ReaderModel(mmdbReader);
      const expected = {
        city: {},
        continent: {},
        country: {},
        location: {},
        maxmind: {},
        postal: {},
        registeredCountry: {},
        representedCountry: {},
        subdivisions: [],
        traits: emptyTraits,
      };

      expect(enterpriseInstance.enterprise('empty')).toEqual(expected);
    });
  });

  describe('isp()', () => {
    const mmdbReader = createMmdbReaderMock('GeoIP2-ISP', ispFixture);

    it('returns isp data', () => {
      const ispInstance = new ReaderModel(mmdbReader);
      expect(ispInstance.isp('123.123')).toEqual(camelcaseKeys(ispFixture));
      expect(ispInstance.isp('123.123').ipAddress).toEqual('123.123');
    });

    it('throws an error if db types do not match', () => {
      const errReader = cloneDeep(mmdbReader);
      errReader.metadata.databaseType = 'foo';

      const ispInstance = new ReaderModel(errReader);
      expect(() => ispInstance.isp('123.123')).toThrow(BadMethodCallError);
    });

    it('throws an error if IP address is not in database', () => {
      const ispInstance = new ReaderModel(mmdbReader);
      expect(() => ispInstance.isp('fail.fail')).toThrow(AddressNotFoundError);
    });

    it('returns empty objects/arrays', () => {
      const ispInstance = new ReaderModel(mmdbReader);
      const expected = {
        ipAddress: 'empty',
      };

      expect(ispInstance.isp('empty')).toEqual(expected);
    });
  });

  describe('domain()', () => {
    const mmdbReader = createMmdbReaderMock('GeoIP2-Domain', domainFixture);

    it('returns domain data', () => {
      const domainInstance = new ReaderModel(mmdbReader);
      expect(domainInstance.domain('123.123')).toEqual(
        camelcaseKeys(domainFixture)
      );
      expect(domainInstance.domain('123.123').ipAddress).toEqual('123.123');
    });

    it('throws an error if db types do not match', () => {
      const errReader = cloneDeep(mmdbReader);
      errReader.metadata.databaseType = 'foo';

      const domainInstance = new ReaderModel(errReader);
      expect(() => domainInstance.domain('123.123')).toThrow(
        BadMethodCallError
      );
    });

    it('throws an error if IP address is not in database', () => {
      const domainInstance = new ReaderModel(mmdbReader);
      expect(() => domainInstance.domain('fail.fail')).toThrow(
        AddressNotFoundError
      );
    });

    it('returns empty objects/arrays', () => {
      const domainInstance = new ReaderModel(mmdbReader);
      const expected = {
        ipAddress: 'empty',
      };

      expect(domainInstance.domain('empty')).toEqual(expected);
    });
  });
});
