/* eslint-disable flowtype/require-valid-file-annotation */
import embeds from '.';

const { PeerTube } = embeds;

describe('PeerTube', () => {
  const match = PeerTube.ENABLED[0];
  test('to be enabled on video link', () => {
    expect(
      'https://peertube.kangoulya.org/videos/watch/adcf53bf-66bf-420c-8cd4-937c9f8e1f8b'.match(match)
    ).toBeTruthy();
  });

  test('to be enabled on embed link', () => {
    expect(
      'https://peertube.kangoulya.org/videos/embed/adcf53bf-66bf-420c-8cd4-937c9f8e1f8b'.match(match)
    ).toBeTruthy();
  });

  test('to not be enabled elsewhere', () => {
    expect('https://peertube.kangoulya.org'.match(match)).toBe(null);
    expect('https://peertube.kangoulya.org/'.match(match)).toBe(null);
    expect('https://peertube.kangoulya.org/videos/'.match(match)).toBe(null);
    expect('https://peertube.kangoulya.org/videos/embed/'.match(match)).toBe(
      null
    );
  });
});
