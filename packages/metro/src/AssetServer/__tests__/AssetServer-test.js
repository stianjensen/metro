/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+javascript_foundation
 * @format
 */

'use strict';

jest.mock('fs');
jest.mock('image-size');

const AssetServer = require('../');
const fs = require('fs');

require('image-size').mockReturnValue({
  width: 300,
  height: 200,
});

describe('AssetServer', () => {
  describe('assetServer.get', () => {
    it('should work for the simple case', () => {
      const server = new AssetServer({
        projectRoots: ['/root'],
      });

      fs.__setMockFilesystem({
        root: {
          imgs: {
            'b.png': 'b image',
            'b@2x.png': 'b2 image',
          },
        },
      });

      return Promise.all([
        server.get('imgs/b.png'),
        server.get('imgs/b@1x.png'),
      ]).then(resp => resp.forEach(data => expect(data).toBe('b image')));
    });

    it('should work for the simple case with platform ext', () => {
      const server = new AssetServer({
        projectRoots: ['/root'],
      });

      fs.__setMockFilesystem({
        root: {
          imgs: {
            'b.ios.png': 'b ios image',
            'b.android.png': 'b android image',
            'c.png': 'c general image',
            'c.android.png': 'c android image',
          },
        },
      });

      return Promise.all([
        server
          .get('imgs/b.png', 'ios')
          .then(data => expect(data).toBe('b ios image')),
        server
          .get('imgs/b.png', 'android')
          .then(data => expect(data).toBe('b android image')),
        server
          .get('imgs/c.png', 'android')
          .then(data => expect(data).toBe('c android image')),
        server
          .get('imgs/c.png', 'ios')
          .then(data => expect(data).toBe('c general image')),
        server
          .get('imgs/c.png')
          .then(data => expect(data).toBe('c general image')),
      ]);
    });

    it('should work for the simple case with jpg', () => {
      const server = new AssetServer({
        projectRoots: ['/root'],
      });

      fs.__setMockFilesystem({
        root: {
          imgs: {
            'b.png': 'png image',
            'b.jpg': 'jpeg image',
          },
        },
      });

      return Promise.all([
        server.get('imgs/b.jpg'),
        server.get('imgs/b.png'),
      ]).then(data => expect(data).toEqual(['jpeg image', 'png image']));
    });

    it('should pick the bigger one', () => {
      const server = new AssetServer({
        projectRoots: ['/root'],
      });

      fs.__setMockFilesystem({
        root: {
          imgs: {
            'b@1x.png': 'b1 image',
            'b@2x.png': 'b2 image',
            'b@4x.png': 'b4 image',
            'b@4.5x.png': 'b4.5 image',
          },
        },
      });

      return server
        .get('imgs/b@3x.png')
        .then(data => expect(data).toBe('b4 image'));
    });

    it('should pick the bigger one with platform ext', () => {
      const server = new AssetServer({
        projectRoots: ['/root'],
      });

      fs.__setMockFilesystem({
        root: {
          imgs: {
            'b@1x.png': 'b1 image',
            'b@2x.png': 'b2 image',
            'b@4x.png': 'b4 image',
            'b@4.5x.png': 'b4.5 image',
            'b@1x.ios.png': 'b1 ios image',
            'b@2x.ios.png': 'b2 ios image',
            'b@4x.ios.png': 'b4 ios image',
            'b@4.5x.ios.png': 'b4.5 ios image',
          },
        },
      });

      return Promise.all([
        server.get('imgs/b@3x.png').then(data => expect(data).toBe('b4 image')),
        server
          .get('imgs/b@3x.png', 'ios')
          .then(data => expect(data).toBe('b4 ios image')),
      ]);
    });

    it('should support multiple project roots', () => {
      const server = new AssetServer({
        projectRoots: ['/root', '/root2'],
      });

      fs.__setMockFilesystem({
        root: {
          imgs: {
            'b.png': 'b image',
          },
        },
        root2: {
          newImages: {
            imgs: {
              'b@1x.png': 'b1 image',
            },
          },
        },
      });

      return server
        .get('newImages/imgs/b.png')
        .then(data => expect(data).toBe('b1 image'));
    });
  });
});
