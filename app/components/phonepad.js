import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PhonepadComponent extends Component {
  @tracked inputValue = '';

  keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  @action
  handleKeyPress(key) {
    this.inputValue += key;
  }

  @action
  makeCall() {
    alert(`Calling via voice to the number: ${this.inputValue}`);
  }
}
