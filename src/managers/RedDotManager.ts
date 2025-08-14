import { EventBus, EVT } from './EventBus';

type Channel = 'missions';

class RedDotManagerImpl {
  private state: Record<Channel, boolean> = { missions: false };

  set(channel: Channel, on: boolean) {
    if (this.state[channel] === on) return;
    this.state[channel] = on;
    EventBus.emit(EVT.RedDotChanged, channel, on);
  }

  get(channel: Channel) {
    return this.state[channel];
  }
}

export const RedDotManager = new RedDotManagerImpl();
