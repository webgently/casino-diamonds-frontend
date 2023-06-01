import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Diamond from '../../components/Diamond';
import Profit from '../../components/Profit';
import Tooltip from '../../components/Tooltip';
import IconMenu from '../../components/Icons';
import useStore from '../../useStore';
import { config } from '../../config/global.const';
import './gamemanager.scss';

let autoPlayInterval: any = null;
let beforeBetBalance = 0;
let playCount = 0;
const diamondList = ['red', 'green', 'blue', 'cyan', 'pink', 'purple', 'yellow'];
const profitCalcList: ProfitListObject[] = [
  { label: '50.00x', value: 50, status: [] },
  { label: '5.00x', value: 5, status: [] },
  { label: '4.00x', value: 4, status: [] },
  { label: '3.00x', value: 3, status: [] },
  { label: '2.00x', value: 2, status: [] },
  { label: '0.10x', value: 0.1, status: [] },
  { label: '0.00x', value: 0, status: [] }
];
const socket = io(config.wwsHost as string);
const GameManager = () => {
  const { auth, update } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const token = new URLSearchParams(useLocation().search).get('cert');

  const [totalBalance, setTotalBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [betWayAuto, setBetWayAuto] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [score, setScore] = useState(0);
  const [diamonds, setDiamonds] = useState<any[]>([]);

  const [onWin, setOnWin] = useState(false);
  const [onLoss, setOnLoss] = useState(false);
  const [betCount, setBetCount] = useState<number>(0);
  const [winPercent, setWinPercent] = useState<number>(0);
  const [lossPercent, setLossPercent] = useState<number>(0);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [lossAmount, setLossAmount] = useState<number>(0);
  const [sameInds, setSameInds] = useState([]);
  const [profitStatus, setProfitStatus] = useState<ProfitListObject[]>([]);
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);

  const initializeDiamods = () => {
    let data: any = [];
    for (let e = 0; e < 5; e++) {
      data.push({ ind: -1, active: false });
    }
    setDiamonds(data);
  };

  const handleSumbit = async () => {
    if (betAmount === 0) {
      toast.error("Insufficient your bet amount");
    }
    if (betWayAuto && autoPlay) {
      setAutoPlay(false);
      clearInterval(autoPlayInterval);
      initializeDiamods();
      initializeProfitList();
      setScore(0);
      beforeBetBalance = totalBalance;
    } else {
      if (!isLoading) {
        initializeDiamods();
        initializeProfitList();
        setScore(0);
        if (betWayAuto) {
          setAutoPlay(true);
          playCount = betCount;
        } else {
          setIsLoading(true);
        }
        socket.emit('playBet', {
          userid: auth?.userid,
          betAmount: betAmount * 100
        });
      }
    }
  };

  const decreaseAmount = () => {
    if (betAmount / 2 >= 0.1) {
      setBetAmount(betAmount / 2);
    } else if (betAmount / 2 < 0.1) {
      setBetAmount(0.1);
    }
  };

  const increaseAmount = () => {
    if (betAmount * 2 <= totalBalance) {
      setBetAmount(betAmount * 2);
    } else if (betAmount * 2 > totalBalance) {
      setBetAmount(totalBalance);
    }
  };

  const refund = () => {
    if (!isLoading) {
      setIsLoading(true);
      socket.emit('refund', { userid: auth?.userid });
    } else {
      toast.error('Refund is loading...')
    }
  };

  useEffect(() => {
    setIsLoading(true);
    socket.emit('join', { token });
    socket.on(`join-${token}`, (e: any) => {
      initializeDiamods();
      update({
        auth: {
          userid: e.userid,
          username: e.username,
          avatar: e.avatar,
          balance: e.balance
        }
      } as StoreObject);
      beforeBetBalance = e.balance;
      setTotalBalance(e.balance);
      setIsLoading(false);
    });
    return () => {
      socket.off('join');
      socket.off(`join-${token}`);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on(`playBet-${auth?.userid}`, async (e: any) => {
      let i = 0;
      let interval = setInterval(() => {
        let diamond = [...diamonds];
        diamond[i].ind = e.diamonds[i];
        setDiamonds(diamond);
        i++;
      }, 500);
      await sleep(2500);
      let diamond = [...diamonds];
      setSameInds(e.sameInds);
      e.sameInds
        .flat()
        .sort()
        // eslint-disable-next-line
        .map((item: any) => {
          diamond[item].active = true;
        });
      if (betCount > 0) {
        setBetCount((prev) => prev - 1);
      }
      if (!betWayAuto) {
        beforeBetBalance = Number(e.balance);
      }
      setDiamonds(diamond);
      setTotalBalance(e.balance);
      clearInterval(interval);
      setScore(e.score);
      if (e.score > 0.1) {
        if (onWin && winPercent > 0) {
          setBetAmount((prev)=> prev + prev * winPercent / 100);
        }
      } else {
        if (onLoss && lossPercent > 0) {
          setBetAmount((prev)=> prev + prev * lossPercent / 100);
        }
      }
      setIsLoading(false);
    });
    socket.on(`refund-${auth?.userid}`, async (e: any) => {
      update({
        auth: {
          ...auth,
          balance: 0
        }
      } as StoreObject);
      setTotalBalance(0);
      toast.success('Balance Refunded');
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = 'http://annie.ihk.vipnps.vip/iGaming-web';
      }, 1500);
    });
    socket.on(`insufficient-${auth?.userid}`, async () => {
      update({
        auth: {
          ...auth,
          balance: 0
        }
      } as StoreObject);
      setTotalBalance(0);
      setDepositModalOpen(true);
    });
    socket.on(`error-${auth?.userid}`, async (e) => {
      toast.error(e);
      setIsLoading(false);
    });
    return () => {
      socket.off(`playBet-${auth?.userid}`);
      socket.off(`refund-${auth?.userid}`);
      socket.off(`insufficient-${auth?.userid}`);
      socket.off(`error-${auth?.userid}`);
    };
    // eslint-disable-next-line
  }, [diamonds]);

  useEffect(() => {
    if (autoPlay && betWayAuto) {
      if (
        (totalBalance - betAmount < 0) ||
        (winAmount > 0 && totalBalance > beforeBetBalance && totalBalance - beforeBetBalance >= winAmount) ||
        (lossAmount > 0 && beforeBetBalance > totalBalance && beforeBetBalance - totalBalance >= lossAmount) ||
        (playCount > 0 && betCount <= 0)
      ) {
        setAutoPlay(false);
        clearInterval(autoPlayInterval);
        beforeBetBalance = totalBalance;
        return;
      }

      autoPlayInterval = setInterval(() => {
        initializeDiamods();
        initializeProfitList();
        setScore(0);
        setIsLoading(true);
        socket.emit('playBet', {
          userid: auth?.userid,
          betAmount: betAmount * 100
        });
      }, 4000);
    }

    return () => {
      clearInterval(autoPlayInterval);
    };
    // eslint-disable-next-line
  }, [autoPlay, totalBalance, betCount, score]);

  useEffect(() => {
    initializeDiamods();
    initializeProfitList();
    setAutoPlay(false);
    setScore(0);
  }, [betWayAuto]);

  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const initializeProfitList = () => {
    let data: ProfitListObject[] = [];
    for (let i = 0; i < 7; i++) {
      data[i] = profitCalcList[i] as ProfitListObject;
      for (let j = 0; j < 5; j++) {
        data[i].status[j] = {
          diamond: (i === 4 && j > 1 && j < 4) || (i === 2 && j > 2 && j < 5) ? 'Diamond2' : 'Diamond1',
          color:
            (j < 2 && i < 6) ||
            (i < 4 && j < 3) ||
            (i < 2 && j < 4) ||
            (i < 1 && j < 5) ||
            (i === 4 && j > 1 && j < 4) ||
            (i === 2 && j > 2 && j < 5)
              ? 'text-[#3f515f]'
              : 'text-[#0e1d27]'
        } as ProfitStatusObject;
      }
    }
    setProfitStatus(data);
  };

  useEffect(() => {
    let data: ProfitListObject[] = [];
    for (let i = 0; i < 7; i++) {
      data[i] = profitCalcList[i] as ProfitListObject;
      for (let j = 0; j < 5; j++) {
        data[i].status[j] = {
          diamond: (i === 4 && j > 1 && j < 4) || (i === 2 && j > 2 && j < 5) ? 'Diamond2' : 'Diamond1',
          color:
            (j < 2 && i < 6) ||
            (i < 4 && j < 3) ||
            (i < 2 && j < 4) ||
            (i < 1 && j < 5) ||
            (i === 4 && j > 1 && j < 4) ||
            (i === 2 && j > 2 && j < 5)
              ? 'text-[#3f515f]'
              : 'text-[#0e1d27]'
        } as ProfitStatusObject;
      }
      const color1 = sameInds[0] && diamondList[diamonds[sameInds[0][0]].ind];
      const color2 = sameInds[1] && diamondList[diamonds[sameInds[1][0]].ind];

      switch (score) {
        case 0.1:
          if (data[5]) {
            for (let i = 0; i < sameInds.flat().length; i++) {
              data[5].status[i] = {
                diamond: 'Diamond1',
                color: `text-${color1}`
              };
            }
          }
          break;
        case 2:
          if (data[4]) {
            for (let i = 0; i < sameInds.flat().length; i++) {
              data[4].status[i] = {
                diamond: i < 2 ? 'Diamond1' : 'Diamond2',
                color: `text-${i < 2 ? color1 : color2}`
              };
            }
          }
          break;
        case 3:
          if (data[3]) {
            for (let i = 0; i < sameInds.flat().length; i++) {
              data[3].status[i] = {
                diamond: 'Diamond1',
                color: `text-${color1}`
              };
            }
          }
          break;
        case 4:
          if (data[2]) {
            for (let i = 0; i < sameInds.flat().length; i++) {
              data[2].status[i] = {
                diamond: i < 3 ? 'Diamond1' : 'Diamond2',
                color: `text-${i < 3 ? color1 : color2}`
              };
            }
          }
          break;
        case 5:
          if (data[1]) {
            for (let i = 0; i < sameInds.flat().length; i++) {
              data[1].status[i] = {
                diamond: 'Diamond1',
                color: `text-${color1}`
              };
            }
          }
          break;
        case 50:
          if (data[0]) {
            for (let i = 0; i < sameInds.flat().length; i++) {
              data[0].status[i] = {
                diamond: 'Diamond1',
                color: `text-${color1}`
              };
            }
          }
          break;
      }
    }
    setProfitStatus(data);
    // eslint-disable-next-line
  }, [score]);

  return (
    <>
      <div className="game-management-layout">
        <div>
          <div className="game-management-header">
            <button className="text-white hover:text-[#d5dceb] flex gap-[10px]" onClick={refund}>
              <IconMenu icon="Back" size={30} />
              <span>Refund</span>
            </button>
            <div className="balance-container">
              <label>Balance</label>
              <div className="balance">
                <span>₹{(totalBalance / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="game-management-body">
            <div className="game-controller">
              <div className="game-play-way-tab">
                <button className={!betWayAuto ? '_active' : ''} onClick={() => setBetWayAuto(false)}>
                  Manual
                </button>
                <button className={betWayAuto ? '_active' : ''} onClick={() => setBetWayAuto(true)}>
                  Auto
                </button>
              </div>
              <div className={`game-setting-controller ${betWayAuto && 'flex-col-reverse slg:flex-col'}`}>
                <div className="bet-amount">
                  <p>
                    <label>Bet Amount</label>
                    <label>₹{Number(betAmount).toFixed(2)}</label>
                  </p>
                  <div className="bet-amount-form">
                    <Input
                      type="number"
                      icon="Coin"
                      min={0}
                      value={betAmount}
                      onChange={(e: any) => totalBalance - Number(e) >= 0 && setBetAmount(Number(e))}
                      disabled={autoPlay}
                    />
                    <div className="bet-amount-double-controller">
                      <button onClick={decreaseAmount}>1/2</button>
                      <button onClick={increaseAmount}>2x</button>
                    </div>
                  </div>
                </div>
                {betWayAuto && (
                  <>
                    <div className="bet-count">
                      <label>Number of Bets</label>
                      <Input
                        type="number"
                        icon="Infinity"
                        min={0}
                        disabled={autoPlay}
                        value={betCount}
                        onChange={setBetCount}
                      />
                    </div>
                    <div className="on-win">
                      <label>On Win</label>
                      <div>
                        <div className="px-[2px]">
                          <button
                            className={!onWin ? '_active' : ''}
                            onClick={() => setOnWin(false)}
                            disabled={autoPlay}
                          >
                            reset
                          </button>
                          <button className={onWin ? '_active' : ''} onClick={() => setOnWin(true)} disabled={autoPlay}>
                            Increase by:
                          </button>
                        </div>
                        <Input
                          type="number"
                          icon="Percent"
                          min={0}
                          disabled={autoPlay || !onWin}
                          value={onWin ? winPercent : 0}
                          onChange={setWinPercent}
                        />
                      </div>
                    </div>
                    <div className="on-loss">
                      <label>On Loss</label>
                      <div>
                        <div className="px-[2px]">
                          <button
                            className={!onLoss ? '_active' : ''}
                            onClick={() => setOnLoss(false)}
                            disabled={autoPlay}
                          >
                            reset
                          </button>
                          <button
                            className={onLoss ? '_active' : ''}
                            onClick={() => setOnLoss(true)}
                            disabled={autoPlay}
                          >
                            Increase by:
                          </button>
                        </div>
                        <Input
                          type="number"
                          icon="Percent"
                          min={0}
                          disabled={autoPlay || !onLoss}
                          value={onLoss ? lossPercent : 0}
                          onChange={setLossPercent}
                        />
                      </div>
                    </div>
                    <div className="stop-profit">
                      <p className="flex justify-between">
                        <label>Stop on Profit</label>
                        <label>₹{Number(winAmount).toFixed(2)}</label>
                      </p>
                      <Input
                        type="number"
                        icon="Coin"
                        min={0}
                        disabled={autoPlay}
                        value={winAmount}
                        onChange={setWinAmount}
                      />
                    </div>
                    <div className="stop-on-Loss">
                      <p className="flex justify-between">
                        <label>Stop on Loss</label>
                        <label>₹{Number(lossAmount).toFixed(2)}</label>
                      </p>
                      <Input
                        type="number"
                        icon="Coin"
                        min={0}
                        disabled={autoPlay}
                        value={lossAmount}
                        onChange={setLossAmount}
                      />
                    </div>
                  </>
                )}
                <div className="play-bet-button">
                  <button onClick={handleSumbit} disabled={autoPlay ? false : isLoading}>
                    {betWayAuto ? (
                      autoPlay ? (
                        'Stop Autobet'
                      ) : (
                        'Start Autobet'
                      )
                    ) : isLoading ? (
                      <BeatLoader color="#013e01" size={10} />
                    ) : (
                      'Bet'
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="game-play-ground">
              <div className="profit-ground">
                <div className="profit-calc-list">
                  <div className="hidden text-red text-green text-blue text-cyan text-pink text-purple text-yellow" />
                  {profitStatus.map((item: any, ind: number) => {
                    return <Profit key={ind} label={item.label} status={item.status} />;
                  })}
                </div>
                <div className="hidden slg:block relative w-full pl-[20px]">
                  <Tooltip profit={(betAmount * score).toFixed(8)} score={score} />
                </div>
              </div>
              <div className="diamond-ground">
                <div className="diamonds-group">
                  {diamonds.map((item: any, ind) => {
                    return (
                      <Diamond
                        key={ind}
                        img={diamondList[item.ind]}
                        active={item.active}
                        shadow={diamonds.filter((item) => item.ind !== -1).length > 0}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal open={depositModalOpen} setOpen={setDepositModalOpen}>
        <div className="game-deposit-modal">
          <div className="modal-close" onClick={() => setDepositModalOpen(false)}>
            &times;
          </div>
          <div>
            <p>Insufficient account balance</p>
            <a href="http://annie.ihk.vipnps.vip/iGaming-web/#/pages/recharge/recharge">
              http://annie.ihk.vipnps.vip/iGaming-web/#/pages/recharge/recharge
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GameManager;
