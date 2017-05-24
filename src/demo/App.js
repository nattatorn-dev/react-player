import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import screenfull from 'screenfull';

import 'normalize.css/normalize.css';
import './defaults.scss';
import './App.scss';
import './Range.scss';

import { version } from '../../package.json';
import ReactPlayer from '../ReactPlayer';
import Duration from './Duration';

const MULTIPLE_SOURCES = [
  {
    src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
    type: 'video/mp4'
  },
  {
    src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv',
    type: 'video/ogv'
  },
  {
    src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.webm',
    type: 'video/webm'
  }
];

export default class App extends Component {
  state = {
    url: '',
    playing: true,
    showAds: false,
    ads: 'https://www.youtube.com/watch?v=06HcgI76ksQ',
    seek: 0,
    volume: 0,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    isFullscreen: false,
    qualityOptions: [
      {
        name: '360',
        value: 'https://www.youtube.com/watch?v=8zyu86kZMFw'
      },
      {
        name: '480',
        value: 'https://www.youtube.com/watch?v=RgKAFK5djSk'
      },
      {
        name: '720',
        value: 'https://www.youtube.com/watch?v=k499H2TnmHM'
      }
    ]
  };
  load = url => {
    this.setState({
      url,
      played: 0,
      loaded: 0
    });
  };
  playPause = () => {
    this.setState((prevState, props) => {
      return { playing: !prevState.playing };
    });
  };
  stop = () => {
    this.setState({ url: null, playing: false });
  };
  setVolume = e => {
    this.setState({ volume: parseFloat(e.target.value) });
  };
  setPlaybackRate = e => {
    console.log(parseFloat(e.target.value));
    this.setState({ playbackRate: parseFloat(e.target.value) });
  };
  onSeekMouseDown = e => {
    console.log('onSeekMouseDown');

    this.setState({ seeking: true });
  };
  onSeekChange = e => {
    console.log('onSeekChange');
    this.setState({ played: parseFloat(e.target.value) });
  };
  onSeekMouseUp = e => {
    console.log('onSeekMouseUp', e.target.value);
    this.setState({ seeking: false, seek: e.target.value });
    this.player.seekTo(parseFloat(e.target.value));
  };
  onProgress = state => {
    // We only want to update time slider if we are not currently seeking
    console.log('mark');
    if (!this.state.seeking) {
      this.setState(state);
    }
  };
  onClickFullscreen = () => {
    this.setState(prevState => {
      !prevState.isFullscreen
        ? screenfull.request(findDOMNode(this.mediaPlayer))
        : screenfull.exit(findDOMNode(this.mediaPlayer));
      return { isFullscreen: !prevState.isFullscreen };
    });
  };
  onConfigSubmit = () => {
    let config;
    try {
      config = JSON.parse(this.configInput.value);
    } catch (error) {
      config = {};
      console.error('Error setting config:', error);
    }
    this.setState(config);
  };
  renderLoadButton = (url, label) => {
    return (
      <button onClick={() => this.load(url)}>
        {label}
      </button>
    );
  };
  handleSelect = e => {
    this.setState({
      url: e.target.value
    });
  };
  handleSkipAds = () => {
    this.setState({
      played: 1,
      playing: false
    });
    this.onEnded();
  };
  onStart = () => {
    this.player.seekTo(parseFloat(this.state.played));
  };
  onEnded = () => {
    console.log('onEnded');
    if (this.state.showAds) {
      this.setState({
        url: 'https://www.youtube.com/watch?v=8zyu86kZMFw',
        played: 0,
        showAds: false,
        playing: true
      });
    }
  };
  componentDidMount() {
    //ads
    this.setState({ url: this.state.ads, showAds: true });
  }
  render() {
    const {
      url,
      showAds,
      playing,
      volume,
      played,
      loaded,
      duration,
      isFullscreen,
      playbackRate,
      soundcloudConfig,
      vimeoConfig,
      youtubeConfig,
      fileConfig,
      seek
    } = this.state;
    const qualityOptions = (e, k) => (
      <option key={k} value={e.value}>
        {e.name}
      </option>
    );
    const width = isFullscreen ? '100%' : 480;
    const height = isFullscreen ? '100%' : 270;

    const SEPARATOR = ' · ';
    return (
      <div className="app">
        <section className="section">
          <h1>ReactPlayer Demo</h1>
          <div
            ref={mediaPlayer => {
              this.mediaPlayer = mediaPlayer;
            }}
            className="rh5v-DefaultPlayer_component"
          >
            <ReactPlayer
              ref={player => {
                this.player = player;
              }}
              className="rh5v-DefaultPlayer_video"
              width={width}
              height={height}
              url={url}
              playing={playing}
              playbackRate={playbackRate}
              volume={volume}
              soundcloudConfig={soundcloudConfig}
              vimeoConfig={vimeoConfig}
              youtubeConfig={youtubeConfig}
              fileConfig={fileConfig}
              onReady={e => console.log('onReady')}
              onStart={this.onStart}
              onPlay={() => this.setState({ playing: true })}
              onPause={() => this.setState({ playing: false })}
              onBuffer={() => console.log('onBuffer')}
              onEnded={this.onEnded}
              onError={e => console.log('onError', e)}
              onProgress={this.onProgress}
              onDuration={duration => this.setState({ duration })}
            />
            {showAds
              ? <div className="ads">
                  <button onClick={this.handleSkipAds}>skip ads</button>
                </div>
              : null}
            <div className="rh5v-DefaultPlayer_controls">
              <div className="rh5v-PlayPause_component">
                <button onClick={this.playPause}>
                  {playing ? 'Pause' : 'Play'}
                </button>
                <div className="seek">
                  {showAds
                    ? <input
                        disabled
                        type="range"
                        min={0}
                        max={1}
                        step="any"
                        value={played}
                        onMouseDown={this.onSeekMouseDown}
                        onChange={this.onSeekChange}
                        onMouseUp={this.onSeekMouseUp}
                      />
                    : <input
                        type="range"
                        min={0}
                        max={1}
                        step="any"
                        value={played}
                        onMouseDown={this.onSeekMouseDown}
                        onChange={this.onSeekChange}
                        onMouseUp={this.onSeekMouseUp}
                      />}

                </div>
                <button onClick={this.onClickFullscreen}>Fullscreen</button>
                <button onClick={this.setPlaybackRate} value={1}>1</button>
                <button onClick={this.setPlaybackRate} value={1.5}>
                  1.5
                </button>
                <button onClick={this.setPlaybackRate} value={2}>2</button>
                <select onChange={this.handleSelect} value={this.state.url}>
                  {this.state.qualityOptions.map(qualityOptions)}
                </select>
              </div>
            </div>
          </div>

          <table>
            <tbody>
              <tr>
                <th>Controls</th>
                <td>
                  <button onClick={this.stop}>Stop</button>
                  <button onClick={this.playPause}>
                    {playing ? 'Pause' : 'Play'}
                  </button>
                  <button onClick={this.onClickFullscreen}>Fullscreen</button>
                  <button onClick={this.setPlaybackRate} value={1}>1</button>
                  <button onClick={this.setPlaybackRate} value={1.5}>
                    1.5
                  </button>
                  <button onClick={this.setPlaybackRate} value={2}>2</button>
                </td>
              </tr>
              <tr>
                <th>Seek</th>
                <td>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={played}
                    onMouseDown={this.onSeekMouseDown}
                    onChange={this.onSeekChange}
                    onMouseUp={this.onSeekMouseUp}
                  />
                </td>
              </tr>
              <tr>
                <th>Volume</th>
                <td>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={volume}
                    onChange={this.setVolume}
                  />
                </td>
              </tr>
              <tr>
                <th>Played</th>
                <td><progress max={1} value={played} /></td>
              </tr>
              <tr>
                <th>Loaded</th>
                <td><progress max={1} value={loaded} /></td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="section">
          <table>
            <tbody>
              <tr>
                <th>YouTube</th>
                <td>
                  {this.renderLoadButton(
                    'https://www.youtube.com/watch?v=oUFJJNQGwhk',
                    'Test A'
                  )}
                  {this.renderLoadButton(
                    'https://www.youtube.com/watch?v=jNgP6d9HraI',
                    'Test B'
                  )}
                </td>
              </tr>
              <tr>
                <th>Google Drive</th>
                <td>
                  {this.renderLoadButton(
                    'https://r12---sn-30a7dn7z.c.docs.google.com/videoplayback?id=52f78599a16bbb05&itag=59&source=webdrive&requiressl=yes&ttl=transient&mm=30&mn=sn-30a7dn7z&ms=nxu&mv=m&pl=21&ei=zZEjWa3OA5f_qgWF3Yi4Cw&driveid=0B1X2LG8ZR3Z9cGx1LU9sZ1JDcU0&mime=video/mp4&lmt=1461350440657915&mt=1495503195&ip=183.88.58.156&ipbits=0&expire=1495517709&cp=QVJOV0ZfVldOSlhNOlUteXZMQXF1emdo&sparams=ip,ipbits,expire,id,itag,source,requiressl,ttl,mm,mn,ms,mv,pl,ei,driveid,mime,lmt,cp&signature=3528EDA32C79028F02F06F9E6F807B91F1466CEA.3DBDBCB5C32B9677B3DAE82DC98C321042CB0D88&key=ck2&app=explorer&cpn=KEFcWtwveiEq8thb&c=WEB&cver=1.20170518',
                    'Test A'
                  )}
                </td>
              </tr>
              <tr>
                <th>Custom URL</th>
                <td>
                  <input
                    ref={input => {
                      this.urlInput = input;
                    }}
                    type="text"
                    placeholder="Enter URL"
                  />
                  <button
                    onClick={() => this.setState({ url: this.urlInput.value })}
                  >
                    Load
                  </button>
                </td>
              </tr>
              <tr>
                <th>Custom config</th>
                <td>
                  <textarea
                    ref={textarea => {
                      this.configInput = textarea;
                    }}
                    placeholder="Enter JSON"
                  />
                  <button onClick={this.onConfigSubmit}>Update Config</button>
                </td>
              </tr>
            </tbody>
          </table>

          <h2>State</h2>

          <table>
            <tbody>
              <tr>
                <th>url</th>
                <td className={!url ? 'faded' : ''}>
                  {(url instanceof Array ? 'Multiple' : url) || 'null'}
                </td>
              </tr>
              <tr>
                <th>playing</th>
                <td>{playing ? 'true' : 'false'}</td>
              </tr>
              <tr>
                <th>volume</th>
                <td>{volume.toFixed(3)}</td>
              </tr>
              <tr>
                <th>played</th>
                <td>{played.toFixed(3)}</td>
              </tr>
              <tr>
                <th>loaded</th>
                <td>{loaded.toFixed(3)}</td>
              </tr>
              <tr>
                <th>duration</th>
                <td><Duration seconds={duration} /></td>
              </tr>
              <tr>
                <th>elapsed</th>
                <td><Duration seconds={duration * played} /></td>
              </tr>
              <tr>
                <th>remaining</th>
                <td><Duration seconds={duration * (1 - played)} /></td>
              </tr>
              <tr>
                <th>fullscreen</th>
                <td>{isFullscreen ? 'true' : 'false'}</td>
              </tr>
              <tr>
                <th>seek</th>
                <td>{seek}</td>
              </tr>

            </tbody>
          </table>
        </section>
        <footer className="footer">
          Version <strong>{version}</strong>
          {SEPARATOR}
          <a href="https://github.com/CookPete/react-player">GitHub</a>
          {SEPARATOR}
          <a href="https://www.npmjs.com/package/react-player">npm</a>
        </footer>
      </div>
    );
  }
}
