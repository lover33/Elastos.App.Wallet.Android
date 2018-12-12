import { Component} from '@angular/core';
import {Config} from '../../../providers/Config';
import { Util } from '../../../providers/Util';
import { NavController, NavParams} from 'ionic-angular';
import {WalletManager} from '../../../providers/WalletManager';
import {Native} from "../../../providers/Native";
@Component({
  selector: 'app-recordinfo',
  templateUrl: './recordinfo.component.html',
})
export class RecordinfoComponent{
  masterWalletId:string = "1";
  transactionRecord: any = {};
  start = 0;
  payStatusIcon: string = "";
  blockchain_url = Config.BLOCKCHAIN_URL;
  public jiajian:any="";
  public inputs:any = [];
  public outputs:any = [];
  constructor(public navCtrl: NavController,public navParams: NavParams, public walletManager: WalletManager,public native :Native){
    this.init();
  }
  init() {
    this.masterWalletId = Config.getCurMasterWalletId();
    let txId = this.navParams.get("txId");
    let chainId = this.navParams.get("chainId");
    this.walletManager.getAllTransaction(this.masterWalletId,chainId, this.start, txId, (data) => {
      if(data["success"]){
        this.native.info(data);
        let allTransaction = JSON.parse(data['success']);
        let transactions = allTransaction['Transactions'];
        let transaction = transactions[0];
        this.inputs = this.objtoarr(transaction["Inputs"]);
        this.outputs = this.objtoarr(transaction["Outputs"]);
        let timestamp = transaction['Timestamp']*1000;
        let datetime = Util.dateFormat(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
        let status = '';
        switch(transaction["Status"])
        {
          case 'Confirmed':
            status = 'Confirmed'
            break;
          case 'Pending':
            status = 'Pending'
            break;
          case 'Unconfirmed':
            status = 'Unconfirmed'
            break;
        }
        let payStatusIcon = transaction["Direction"];
        if (payStatusIcon === "Received") {
          this.payStatusIcon = './assets/images/tx-state/icon-tx-received-outline.svg';
          this.jiajian = "+";
        } else if(payStatusIcon === "Sent") {
          this.payStatusIcon = './assets/images/tx-state/icon-tx-sent.svg';
          this.jiajian = "-";
        } else if(payStatusIcon === "Moved") {
          this.payStatusIcon = './assets/images/tx-state/icon-tx-moved.svg';
          this.jiajian = "";
        }

        this.transactionRecord = {
          name: chainId,
          status: status,
          resultAmount: Util.scientificToNumber(transaction["Amount"]/Config.SELA),
          txId: txId,
          transactionTime: datetime,
          timestamp: timestamp,
          payfees: Util.scientificToNumber(transaction['Fee']/Config.SELA),
          confirmCount: transaction["ConfirmStatus"],
          remark: transaction["Remark"]
         }
      }else{
          alert("======getAllTransaction====error"+JSON.stringify(data));
      }

    });
  }

  onNext(address){
    this.native.copyClipboard(address);
    this.native.toast_trans('copy-ok');
  }

  tiaozhuan(txId){
   self.location.href=this.blockchain_url + 'tx/' + txId;
  }

  doRefresh(refresher){
    this.init();
    setTimeout(() => {
      refresher.complete();
    },1000);
  }

  objtoarr(obj){
    let arr = []
    if(obj){
       for(let i in obj) {
         if(arr.length<3)
         arr.push({"address":i,"balance":Util.scientificToNumber(obj[i]/Config.SELA)});
         }

         if(arr.length>2){
          arr.push({"address":"...........","balance":"............."});
          return arr;
         }
    }
      return arr;
}

}
