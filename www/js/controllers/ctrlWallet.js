angular.module('leth.controllers')
  .controller('WalletCtrl', function ($interval, $scope, $rootScope, $stateParams, $ionicLoading, $ionicModal, $state,
                                      $ionicPopup, $cordovaBarcodeScanner, $ionicActionSheet,
                                      $timeout, AppService, Transactions,ExchangeService, Chat) {
    var TrueException = {};
    var FalseException = {};

    var setCoin = function(index){
      if(index==0){
        $scope.idCoin = 0;
        $scope.logoCoin = "img/ethereum-icon.png";
        $scope.descCoin = "Eth from main wallet";
        $scope.symbolCoin = "Ξ";
        $scope.decimals = "6";
        $scope.xCoin = "XETH";
        $scope.listUnit = [
    			{multiplier: "1.0e18", unitName: "ether", unitIcon: "Ξ"},
    			{multiplier: "1.0e15", unitName: "finney", unitIcon: "finney"}
    		];
        $scope.unit = $scope.listUnit[0].multiplier;
        $scope.balance = AppService.balance($scope.unit);
        $scope.symbolFee = $scope.symbolCoin;

        $scope.minFee = 371007000000000;
        $scope.maxFee = 11183211000000000;
        $scope.step = 344506500000000;
        $scope.fee= 1060020000000000;
      }
      else {
      	$scope.getNetwork();
    		var activeCoins=$scope.listCoins.filter( function(obj) {return obj.Network==$scope.nameNetwork && obj.Installed ;} );
        $scope.idCoin = index;
        $scope.logoCoin = activeCoins[index-1].Logo;
        $scope.descCoin = activeCoins[index-1].Abstract;
        $scope.symbolCoin = activeCoins[index-1].Symbol;
        $scope.decimals = activeCoins[index-1].Decimals;
        $scope.xCoin = activeCoins[index-1].Exchange;
        $scope.methodSend = activeCoins[index-1].Send;
        $scope.contractCoin = web3.eth.contract(activeCoins[index-1].ABI).at(activeCoins[index-1].Address);
        if ($scope.symbolCoin=="Ա"||$scope.symbolCoin=="Ucal"||$scope.symbolCoin=="Bacini" || $scope.symbolCoin=="Ƀ") {
          $scope.listUnit = [
            {multiplier: "1", unitName: "Ucal", unitIcon : "Ա", unitRound:"6"},
            {multiplier: "0.000001", unitName: "Bacini" , unitIcon: "Ƀ", unitRound:"0"}
          ];
          $scope.unit = $scope.listUnit[0].multiplier;
          $scope.balance = AppService.balanceOf($scope.contractCoin,$scope.unit + 'e+' + $scope.decimals);
          $scope.symbolFee = $scope.symbolCoin;
          // animator( $scope.shapes, $timeout, false );

        } else {
            $scope.symbolFee = "Ξ";
    		    $scope.listUnit = activeCoins[index-1].Units;
            $scope.unit = $scope.listUnit[0].multiplier;
            $scope.balance = AppService.balanceOf($scope.contractCoin,$scope.unit + 'e+' + $scope.decimals);
        }
      }

      $scope.unitRound = 6;

      $scope.minFee = 371007000000000;
      $scope.maxFee = 11183211000000000;
      $scope.step = 344506500000000;
      $scope.fee= 1060020000000000;

      var unit = 1.0e18;
      if($scope.idCoin==0) unit = $scope.unit;
      $scope.feeLabel = $scope.fee  / unit;
      if($scope.symbolCoin=="Ա" || $scope.symbolCoin=="Ƀ") {
        console.log("Update ucal fee:"+AppService.getUCALCurrencyRate($scope.contractCoin));
        // $scope.fee*=  (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin);
        // $scope.feeLabel = (Math.round($scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin) * 1000000)/1000000)/ $scope.unit;
        $scope.fee = AppService.getUCALTransactionFee($scope.contractCoin) / AppService.getUCALCurrencyRate($scope.contractCoin);
        $scope.feeLabel = (Math.round($scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin) * 1000000)/1000000)/ $scope.unit;
        // $scope.feeLabel = (Math.round($scope.fee * (1/(1.0e18)) * 1000000)/1000000)/ $scope.unit;
        //convert back : efee = $scope.fee / AppService.getUCALCurrencyRate($scope.contractCoin)
      }

      updateExchange();
      ////For ball
      $scope.shapes = [];
      for (i = 0; i < ($scope.balance<100 ? $scope.balance : 100); i++) {
          $scope.shapes.push( buildShape() );
      }
    }
    var setDefaultsUCALCoin = function(){
      // console.log("setDefaultsUCALCoin");
      var activeCoins=$scope.listCoins.filter( function(obj) {return (obj.Network==$scope.nameNetwork) && (obj.Installed);} );
       for (var i = 0; i < activeCoins.length; i++) {
        //  console.log(">>>"+activeCoins[i].Name);
         if (activeCoins[i].Name=="UCAL"){
          //  console.log(">>>>index:"+i);
           setCoin(i+1);
           break;
         }
       }
    }
    var updateExchange = function(){
      if($scope.xCoin){
        ExchangeService.getTicker($scope.xCoin, JSON.parse(localStorage.BaseCurrency).value).then(function(value){
          $scope.balanceExc = JSON.parse(localStorage.BaseCurrency).symbol + " " + parseFloat((value * $scope.balance).toFixed(2)) ;
        });
      }else{
        $scope.balanceExc = JSON.parse(localStorage.BaseCurrency).symbol + " " + parseFloat((0).toFixed(2)) ;
      }
    };

    $scope.playAudio = function(input) {
           var audio = new Audio(input);
           audio.play();
    };
    var theInterval = $interval(function(){
      // console.log("theInterval");
      var oldBalance = $scope.balance;
      if($scope.idCoin==0 || $scope.idCoin==undefined) {
        $scope.balance = AppService.balance($scope.unit);
      }else {
        $scope.balance = AppService.balanceOf($scope.contractCoin,$scope.unit + 'e+' + $scope.decimals);
      }
      if($scope.symbolCoin=="Ա" || $scope.symbolCoin=="Ƀ") {
        $scope.fee = AppService.getUCALTransactionFee($scope.contractCoin) / AppService.getUCALCurrencyRate($scope.contractCoin);
        $scope.feeLabel = (Math.round($scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin) * 1000000)/1000000)/ $scope.unit;
        // // $scope.transactions = Transactions.checkAmountPending('Ա');
        // // console.log("Transactions ls:"+$scope.pendingBalance);
        // // console.log($scope.transactions);
        // // var transactions = $scope.transactions;
        // console.log("transactions::::::::");
        // console.log($scope.transactions);

        $scope.transactions = Transactions.all();
        $scope.pendingBalance = 0;
        for (var t in $scope.transactions){
          if (!$scope.transactions[t].block){
            $scope.pendingBalance+=$scope.transactions[t].value * ($scope.unit==1 ? 1 : 1000000 )  / (1+'e+' + $scope.decimals) + $scope.feeLabel;
            console.log("Pending");
            // console.log($scope.transactions[t]);
            // $scope.$digest();
            var transaction = JSON.parse(JSON.stringify($scope.transactions[t]));
            web3.eth.getTransaction(transaction.id, function(err,res){
              if (res && res.blockNumber) {
                $scope.transactions.filter(function (val) {
                  if(val.id == transaction.id){
                    val.block = res.blockNumber;
                    // console.log("Transactions is executed:"+val.block+" ");
                    localStorage.Transactions = JSON.stringify($scope.transactions);
                  }
                });
              }
            });
          }
        }
        // console.log("pendingAmount:"+$scope.pendingBalance);
        // if(localStorage.Transactions != JSON.stringify($scope.transactions)){
        //   console.log("Update list transaction");
        //   localStorage.Transactions = JSON.stringify($scope.transactions);
        // }
      }
      if(oldBalance != $scope.balance){
        console.log("Updated =>>>>>>>>>>>>>>>>>>>"+oldBalance+"<vs>"+$scope.balance);
        //add sound here
        $scope.playAudio("../../audio/3 Tone Notification0.mp3");
      }
    }.bind(this), 10000);

    var theIntervalForBall = $interval(function(){
      // if(!($scope.symbolCoin=="Ա" || $scope.symbolCoin=="Ƀ")) {
      //   return;
      // }
      var shapes = $scope.shapes;
      var i;
      var now = new Date().getTime();
      var maxX      = 1450;
      var maxY      = 600;
      // var now = new Date().getTime();

       for (i = 0; i < shapes.length; i++) {
         var shape = shapes[i];
         var elapsed = (shape.timestamp || now) - now;

         shape.timestamp = now;
         shape.x += elapsed * shape.velX / 1000;
         shape.y += elapsed * shape.velY / 1000;

         if (shape.x > maxX) {
             shape.x = 2 * maxX - shape.x;
             shape.velX *= -1;
         }
         if (shape.x < 30) {
             shape.x = 30;
             shape.velX *= -1;
         }

         if (shape.y > maxY) {
             shape.y = 2 * maxY - shape.y;
             shape.velY *= -1;
         }
         if (shape.y < 20) {
             shape.y = 20;
             shape.velY *= -1;
         }
       }
     }.bind(this), 30);

    $scope.$on('$destroy', function () {
      $interval.cancel(theInterval);
      $interval.cancel(theIntervalForBall);
    });

    $scope.$on('$ionicView.enter', function() {
      $rootScope.hideTabs = ''; //patch
      if($scope.idCoin==0 || $scope.idCoin==undefined)
        $scope.balance = AppService.balance($scope.unit);
      else
        $scope.balance = AppService.balanceOf($scope.contractCoin,$scope.unit + 'e+' + $scope.decimals);

      $scope.minFee = 371007000000000;
      $scope.maxFee = 11183211000000000;
      $scope.step = 344506500000000;
      $scope.fee = 1060020000000000;
      $scope.feeLabel = $scope.fee / $scope.unit;

      if($scope.symbolCoin=="Ա" || $scope.symbolCoin=="Ƀ") {
        $scope.fee = AppService.getUCALTransactionFee($scope.contractCoin) / AppService.getUCALCurrencyRate($scope.contractCoin);
        $scope.feeLabel = (Math.round($scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin) * 1000000)/1000000)/ $scope.unit;
      }

      console.log("scope.fee:"+ $scope.fee);
      console.log("scope.unit:"+ $scope.unit);

      updateExchange();
    })

    //set Eth for default
    // setCoin(0);

    setDefaultsUCALCoin();

    $scope.fromAddressBook = false;

    if($stateParams.addr){
      //xxxx#yyy@123
      var addresses = $stateParams.addr.split('#');
      var coins = $stateParams.addr.split('@').length>1 ? $stateParams.addr.split('@')[1] : "";
      var addr = addresses[0];
      var idkey = addresses.length > 1 ? addresses[1].split('@')[0] : "";
      $scope.addrTo = addr;
      $scope.addrKey = idkey;
      $scope.amountTo = parseFloat(coins);
      $scope.fromAddressBook = true;
    }else {
      $scope.fromAddressBook = false;
    }

    $scope.scrollRefresh = function(){
      refresh();
    }

    $scope.sendCoins = function (addr, amount, unit, idCoin, msgText) {
      var value = parseFloat(amount) * unit;
      if( $scope.idCoin==0){
        AppService.transferEth($scope.account, addr, value, $scope.fee).then(
          function (result) {
            $ionicLoading.show({template: 'Sending...'});
            if (result[0] != undefined) {
              var errorPopup = $ionicPopup.alert({
                title: 'Error',
                template: result[0]
              });
              errorPopup.then(function (res) {
                $ionicLoading.hide();
                console.log(res);
              });
            } else {
              var successPopup = $ionicPopup.alert({
                title: 'Transaction sent',
                template: result[1]
              });
              successPopup.then(function (res) {
                $ionicLoading.hide();

                $state.go('tab.transall');
              });
              //save transaction
              var newT = {from: $scope.account, to: addr, id: result[1], value: value, unit: unit, symbol: $scope.symbolCoin,unitRound:$scope.unitRound, time: new Date().getTime()};
              $scope.transactions = Transactions.add(newT);
              // Chat.sendTransactionNote(newT);
              refresh();
            }
          },
          function (err) {
            var alertPopup = $ionicPopup.alert({
              title: 'Error',
              template: err

            });
            alertPopup.then(function (res) {
              $ionicLoading.hide();
              console.log(err);
            });
        });
      } else if ($scope.symbolCoin=="Ա"  || $scope.symbolCoin=="Ƀ") {
        // value = parseFloat(amount + $scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin)) * unit;
        var ufee =  parseFloat($scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin)) * unit * ($scope.symbolCoin=="Ա" ? 1 : 1000000);
        console.log("inside:"+value+" vs "+unit + " vs "+ufee);
        var totalSend = value+ufee;
        var balanceNow = parseFloat($scope.balance) * unit;
        console.log("Balance:"+balanceNow+" vs "+totalSend+"  >>"+(balanceNow>=totalSend) );
        if (balanceNow<totalSend) {
          var alertPopup = $ionicPopup.alert({
            title: 'Error',
            template: 'Noooooooooooooooooooooooo out of total balance'

          });
          alertPopup.then(function (res) {
            $ionicLoading.hide();
            // console.log(err);
          });
          return;
        }
        AppService.transferUCALCoin($scope.contractCoin, $scope.methodSend, $scope.account, addr, value, ufee, $scope.fee, msgText).then(
          function (result) {
            $ionicLoading.show({template: 'Sending UCAL...'});
            if (result[0] != undefined) {
              var errorPopup = $ionicPopup.alert({
                title: 'Error',
                template: result[0]
              });
              errorPopup.then(function (res) {
                $ionicLoading.hide();
                console.log(res);
              });
            } else {
              var successPopup = $ionicPopup.alert({
                title: 'Transaction sent',
                template: result[1]
              });
              successPopup.then(function (res) {
                $ionicLoading.hide();

                $state.go('tab.transall');
              });
              //save transaction
              var newT = {from: $scope.account, to: addr, id: result[1], value: (parseFloat(amount) * unit), unit: unit, symbol: $scope.symbolCoin,unitRound:$scope.unitRound, time: new Date().getTime()};
              $scope.transactions = Transactions.add(newT);
              // Chat.sendTransactionNote(newT);
              refresh();
            }
          },
          function (err) {
            var alertPopup = $ionicPopup.alert({
              title: 'Error',
              template: err

            });
            alertPopup.then(function (res) {
              $ionicLoading.hide();
              console.log(err);
            });
        });
      } else{
        AppService.transferCoin($scope.contractCoin, $scope.methodSend, $scope.account, addr, value).then(
          function (result) {
            if (result[0] != undefined) {
              var errorPopup = $ionicPopup.alert({
                title: 'Error',
                template: result[0]
              });
              errorPopup.then(function (res) {
                $ionicLoading.hide();
                console.log(res);
              });
            } else {
              var successPopup = $ionicPopup.alert({
                title: 'Transaction sent',
                template: result[1]
              });
              successPopup.then(function (res) {
                $ionicLoading.hide();

                $state.go('tab.transall');
              });
              //save transaction
              var newT = {from: $scope.account, to: addr, id: result[1], value: value, unit: unit, symbol: $scope.symbolCoin,unitRound:$scope.unitRound, time: new Date().getTime()};
              $scope.transactions = Transactions.add(newT);
              // Chat.sendTransactionNote(newT);
              refresh();
            }
          },
          function (err) {
            var alertPopup = $ionicPopup.alert({
              title: 'Error',
              template: err

            });
            alertPopup.then(function (res) {
              $ionicLoading.hide();
              console.log(err);
            });
        });
      }//else
    };

    $scope.setFee = function(val){
      $scope.fee= val;
      var unit = 1.0e18;
      if($scope.idCoin==0) unit = $scope.unit;
      $scope.feeLabel = $scope.fee  / unit;
      // if($scope.symbolCoin=="Ա") {
      //   console.log("Update ucal fee");
      //   $scope.fee*=  (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin);
      //   $scope.feeLabel = Math.round($scope.fee * 1000000)/1000000;
      // }
      if($scope.symbolCoin=="Ա" || $scope.symbolCoin=="Ƀ") {
        $scope.fee = AppService.getUCALTransactionFee($scope.contractCoin) / AppService.getUCALCurrencyRate($scope.contractCoin);
        $scope.feeLabel = (Math.round($scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin) * 1000000)/1000000)/ $scope.unit;
      }
    }
    $scope.unitChanged = function(u){
      var unt = $scope.listUnit.filter(function (val) {
        if(val.multiplier === u)
          return val;
      });
      $scope.balance = AppService.balance(unt[0].multiplier);
      $scope.symbolCoin = unt[0].unitIcon;
      $scope.unit = unt[0].multiplier;

      if($scope.idCoin==0){
        $scope.feeLabel = $scope.fee  / $scope.unit;
        $scope.symbolFee = $scope.symbolCoin;
        $scope.unitRound = 6;
      } else if ($scope.symbolCoin=="Ա"||$scope.symbolCoin=="Ucal"||$scope.symbolCoin=="Bacini" || $scope.symbolCoin=="Ƀ") {
        $scope.balance = AppService.balanceOf($scope.contractCoin,$scope.unit + 'e+' + $scope.decimals);
        $scope.unitRound = unt[0].unitRound;
        $scope.fee = AppService.getUCALTransactionFee($scope.contractCoin) / AppService.getUCALCurrencyRate($scope.contractCoin);
        $scope.feeLabel = (Math.round($scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin) * 1000000)/1000000)/ $scope.unit;
        $scope.symbolFee = $scope.symbolCoin;
      }
      console.log("balance:"+$scope.balance+"  "+$scope.listUnit.length);
    }

    $scope.confirmSend = function (addr, amount, unit , idCoin, msgText) {//addrTo,amountTo,unit,idCoin,msgText
      console.log("confirmSend:"+amount+" "+unit+" with msg:"+msgText);
      console.log($scope);
      var total = parseFloat(amount);
      var unit = $scope.unit;
      if($scope.idCoin==0){
        var valueFee = parseFloat($scope.fee / unit);
        total = parseFloat(amount + valueFee) ;
      } else if ($scope.symbolCoin=="Ա"  || $scope.symbolCoin=="Ƀ") {
        var valueFee = (Math.round($scope.fee * (1/(1.0e18))*AppService.getUCALCurrencyRate($scope.contractCoin) * 1000000)/1000000)/unit;
        total = parseFloat(amount + valueFee) ;
      }
      if ($scope.symbolCoin=="Ա"||$scope.symbolCoin=="Ucal"||$scope.symbolCoin=="Bacini" || $scope.symbolCoin=="Ƀ") {
        unit = $scope.unit+'e+' + $scope.decimals;
      }
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm payment',
        template: 'Send ' + total + " " + document.querySelector('#valuta option:checked').text + " to " + addr + " ?"
      });
      confirmPopup.then(function (res) {
        if (res) {
          $scope.sendCoins(addr, amount ,unit,$scope.idCoin , msgText);
        } else {
          $ionicLoading.hide();
          //console.log('send coins aborted');
        }
      });
    };

    $scope.checkAddress = function (address) {
      try {
        angular.forEach(this.friends, function(value, key) {
          if(value.addr != address){
            throw TrueException;
          }else {
            throw FalseException;
          }
        })
      }catch (e){
        if(e === TrueException){
          $scope.toAdd = true;
        }else if(e===FalseException) {
          $scope.toAdd = false;
        }
      }
    }

    $scope.clearAddrTo = function(){
      $scope.fromAddressBook = false;
    }

    $scope.chooseCoin = function(){
		  //$scope.getNetwork();
      var buttonsGroup = [{text: '<span style="text-align:left"><img width="30px" heigth="30px" src="img/ethereum-icon.png"/> Ether [Ξ]</span>'}];

	   var activeCoins=$scope.listCoins.filter( function(obj) {return (obj.Network==$scope.nameNetwork) && (obj.Installed);} );
      for (var i = 0; i < activeCoins.length; i++) {
        var text = {text: '<img width="30px" heigth="30px" src="' + activeCoins[i].Logo + '"/> ' + activeCoins[i].Name + " [" + activeCoins[i].Symbol + "]"};
        buttonsGroup.push(text);
      }

      var hideSheet = $ionicActionSheet.show({
        buttons: buttonsGroup,
        destructiveText: (ionic.Platform.isAndroid()?'<i class="icon ion-android-exit assertive"></i> ':'')+'Cancel',
        titleText: 'Choose coins to pay with',
        destructiveButtonClicked:  function() {
          hideSheet();
        },
        buttonClicked: function(index) {
          setCoin(index);
          hideSheet();
          $timeout(function() {
           hideSheet();
          }, 20000);
        }
      })
    };

    $scope.listTransaction = function(){
      $state.go('tab.transall');
    }

    function buildShape () {
        var maxVelocity = 200;
        return {
            color     : '#FFFF00',//'#' + (Math.random() * 0xFFFFFF << 0).toString(16),
            x         : Math.min(380,Math.max(20,(Math.random() * 380))),
            y         : Math.min(180,Math.max(20,(Math.random() * 180))),

            velX    : (Math.random() * maxVelocity),
            velY    : (Math.random() * maxVelocity)
        };
    };

  });
