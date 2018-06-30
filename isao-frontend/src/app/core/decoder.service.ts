import { Injectable, Inject } from '@angular/core';
const abiDecoder = require('abi-decoder');

@Injectable()
export class DecoderService {

  public abi = abiDecoder;

  public constructor(
    @Inject('AppConfig') private $config
  ) {
    abiDecoder.addABI(this.$config.isaoAbi);
  }
}
