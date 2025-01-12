package channels

import (
	"net/http"
	"strconv"

	"github.com/cockroachdb/errors"
	"github.com/rs/zerolog/log"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/lightningnetwork/lnd/lnrpc"

	"github.com/lncapital/torq/internal/settings"
	"github.com/lncapital/torq/pkg/commons"
	"github.com/lncapital/torq/pkg/server_errors"
)

type channelBody struct {
	NodeId                       int                  `json:"nodeId"`
	ChannelId                    int                  `json:"channelId"`
	ChannelPoint                 string               `json:"channelPoint"`
	NodeName                     string               `json:"nodeName"`
	Active                       bool                 `json:"active"`
	Gauge                        float64              `json:"gauge"`
	RemotePubkey                 string               `json:"remotePubkey"`
	FundingTransactionHash       string               `json:"fundingTransactionHash"`
	FundingOutputIndex           int                  `json:"fundingOutputIndex"`
	LNDShortChannelId            string               `json:"lndShortChannelId"`
	ShortChannelId               string               `json:"shortChannelId"`
	Capacity                     int64                `json:"capacity"`
	LocalBalance                 int64                `json:"localBalance"`
	RemoteBalance                int64                `json:"remoteBalance"`
	UnsettledBalance             int64                `json:"unsettledBalance"`
	CommitFee                    int64                `json:"commitFee"`
	CommitWeight                 int64                `json:"commitWeight"`
	FeePerKw                     int64                `json:"feePerKw"`
	FeeBaseMsat                  uint64               `json:"feeBaseMsat"`
	MinHtlcMsat                  uint64               `json:"minHtlcMsat"`
	MaxHtlcMsat                  uint64               `json:"maxHtlcMsat"`
	TimeLockDelta                uint32               `json:"timeLockDelta"`
	FeeRateMilliMsat             uint64               `json:"feeRateMilliMsat"`
	RemoteFeeBaseMsat            uint64               `json:"remoteFeeBaseMsat"`
	RemoteMinHtlcMsat            uint64               `json:"remoteMinHtlcMsat"`
	RemoteMaxHtlcMsat            uint64               `json:"remoteMaxHtlcMsat"`
	RemoteTimeLockDelta          uint32               `json:"remoteTimeLockDelta"`
	RemoteFeeRateMilliMsat       uint64               `json:"remoteFeeRateMilliMsat"`
	PendingForwardingHTLCsCount  int                  `json:"pendingForwardingHTLCsCount"`
	PendingForwardingHTLCsAmount int64                `json:"pendingForwardingHTLCsAmount"`
	PendingLocalHTLCsCount       int                  `json:"pendingLocalHTLCsCount"`
	PendingLocalHTLCsAmount      int64                `json:"pendingLocalHTLCsAmount"`
	PendingTotalHTLCsCount       int                  `json:"pendingTotalHTLCsCount"`
	PendingTotalHTLCsAmount      int64                `json:"pendingTotalHTLCsAmount"`
	TotalSatoshisSent            int64                `json:"totalSatoshisSent"`
	NumUpdates                   uint64               `json:"numUpdates"`
	Initiator                    bool                 `json:"initiator"`
	ChanStatusFlags              string               `json:"chanStatusFlags"`
	LocalChanReserveSat          int64                `json:"localChanReserveSat"`
	RemoteChanReserveSat         int64                `json:"remoteChanReserveSat"`
	CommitmentType               lnrpc.CommitmentType `json:"commitmentType"`
	Lifetime                     int64                `json:"lifetime"`
	TotalSatoshisReceived        int64                `json:"totalSatoshisReceived"`
	MempoolSpace                 string               `json:"mempoolSpace"`
	AmbossSpace                  string               `json:"ambossSpace"`
	OneMl                        string               `json:"oneMl"`
	PeerAlias                    string               `json:"peerAlias"`
}

type PendingHtlcs struct {
	ForwardingCount  int   `json:"forwardingCount"`
	ForwardingAmount int64 `json:"forwardingAmount"`
	LocalCount       int   `json:"localCount"`
	LocalAmount      int64 `json:"localAmount"`
	TotalCount       int   `json:"toalCount"`
	TotalAmount      int64 `json:"totalAmount"`
}

type ChannelPolicy struct {
	Disabled        bool   `json:"disabled" db:"disabled"`
	TimeLockDelta   uint32 `json:"timeLockDelta" db:"time_lock_delta"`
	MinHtlcMsat     uint64 `json:"minHtlcMsat" db:"min_htlc"`
	MaxHtlcMsat     uint64 `json:"maxHtlcMsat" db:"max_htlc_msat"`
	FeeRateMillMsat uint64 `json:"feeRateMillMsat" db:"fee_rate_mill_msat"`
	ShortChannelId  string `json:"shortChannelId" db:"short_channel_id"`
	FeeBaseMsat     uint64 `json:"feeBaseMsat" db:"fee_base_msat"`
	NodeId          int    `json:"nodeId" db:"node_id"`
	RemoteNodeId    int    `json:"RemoteodeId" db:"remote_node_id"`
}

func updateChannelsHandler(c *gin.Context, db *sqlx.DB, eventChannel chan interface{}) {
	var requestBody commons.UpdateChannelRequest
	if err := c.BindJSON(&requestBody); err != nil {
		server_errors.SendBadRequestFromError(c, errors.Wrap(err, server_errors.JsonParseError))
		return
	}

	response, err := updateChannels(db, requestBody, eventChannel)
	if err != nil {
		server_errors.WrapLogAndSendServerError(c, err, "Update channel/s policy")
		return
	}

	c.JSON(http.StatusOK, response)
}

func batchOpenHandler(c *gin.Context, db *sqlx.DB) {
	var batchOpnReq commons.BatchOpenRequest
	if err := c.BindJSON(&batchOpnReq); err != nil {
		server_errors.SendBadRequestFromError(c, errors.Wrap(err, server_errors.JsonParseError))
		return
	}

	response, err := batchOpenChannels(db, batchOpnReq)
	if err != nil {
		server_errors.WrapLogAndSendServerError(c, err, "Batch open channels")
		return
	}

	c.JSON(http.StatusOK, response)
}

func getChannelListHandler(c *gin.Context, db *sqlx.DB) {
	var channelsBody []channelBody
	activeNcds, err := settings.GetActiveNodesConnectionDetails(db)
	if err != nil {
		server_errors.WrapLogAndSendServerError(c, err, "List channels")
		return
	}
	if len(activeNcds) != 0 {
		for _, ncd := range activeNcds {
			// Force Response because we don't care about balance accuracy
			channelBalanceStates := commons.GetChannelStates(ncd.NodeId, true)
			nodeSettings := commons.GetNodeSettingsByNodeId(ncd.NodeId)
			for _, channel := range channelBalanceStates {
				channelSettings := commons.GetChannelSettingByChannelId(channel.ChannelId)
				lndShortChannelIdString := strconv.FormatUint(channelSettings.LndShortChannelId, 10)

				pendingHTLCs := calculateHTLCs(channel.PendingHtlcs)

				gauge := (float64(channel.LocalBalance) / float64(channelSettings.Capacity)) * 100

				remoteNode := commons.GetNodeSettingsByNodeId(channel.RemoteNodeId)
				chanBody := channelBody{
					NodeId:                       ncd.NodeId,
					ChannelId:                    channelSettings.ChannelId,
					NodeName:                     *nodeSettings.Name,
					Active:                       !channel.LocalDisabled,
					ChannelPoint:                 commons.CreateChannelPoint(channelSettings.FundingTransactionHash, channelSettings.FundingOutputIndex),
					Gauge:                        gauge,
					RemotePubkey:                 remoteNode.PublicKey,
					FundingTransactionHash:       channelSettings.FundingTransactionHash,
					FundingOutputIndex:           channelSettings.FundingOutputIndex,
					LNDShortChannelId:            lndShortChannelIdString,
					ShortChannelId:               channelSettings.ShortChannelId,
					Capacity:                     channelSettings.Capacity,
					LocalBalance:                 channel.LocalBalance,
					RemoteBalance:                channel.RemoteBalance,
					UnsettledBalance:             channel.UnsettledBalance,
					TotalSatoshisSent:            channel.TotalSatoshisSent,
					TotalSatoshisReceived:        channel.TotalSatoshisReceived,
					PendingForwardingHTLCsCount:  pendingHTLCs.ForwardingCount,
					PendingForwardingHTLCsAmount: pendingHTLCs.ForwardingAmount,
					PendingLocalHTLCsCount:       pendingHTLCs.LocalCount,
					PendingLocalHTLCsAmount:      pendingHTLCs.LocalAmount,
					PendingTotalHTLCsCount:       pendingHTLCs.TotalCount,
					PendingTotalHTLCsAmount:      pendingHTLCs.TotalAmount,
					CommitFee:                    channel.CommitFee,
					CommitWeight:                 channel.CommitWeight,
					FeePerKw:                     channel.FeePerKw,
					FeeBaseMsat:                  channel.LocalFeeBaseMsat,
					MinHtlcMsat:                  channel.LocalMinHtlcMsat,
					MaxHtlcMsat:                  channel.LocalMaxHtlcMsat,
					TimeLockDelta:                channel.LocalTimeLockDelta,
					FeeRateMilliMsat:             channel.LocalFeeRateMilliMsat,
					RemoteFeeBaseMsat:            channel.RemoteFeeBaseMsat,
					RemoteMinHtlcMsat:            channel.RemoteMinHtlcMsat,
					RemoteMaxHtlcMsat:            channel.RemoteMaxHtlcMsat,
					RemoteTimeLockDelta:          channel.RemoteTimeLockDelta,
					RemoteFeeRateMilliMsat:       channel.RemoteFeeRateMilliMsat,
					NumUpdates:                   channel.NumUpdates,
					Initiator:                    channelSettings.InitiatingNodeId != nil && *channelSettings.InitiatingNodeId == ncd.NodeId,
					ChanStatusFlags:              channel.ChanStatusFlags,
					CommitmentType:               channel.CommitmentType,
					Lifetime:                     channel.Lifetime,
					MempoolSpace:                 commons.MEMPOOL + lndShortChannelIdString,
					AmbossSpace:                  commons.AMBOSS + channelSettings.ShortChannelId,
					OneMl:                        commons.ONEML + lndShortChannelIdString,
				}

				peerInfo, err := GetNodePeerAlias(ncd.NodeId, channel.RemoteNodeId, db)
				if err == nil {
					chanBody.PeerAlias = peerInfo
				} else {
					log.Error().Err(err).Msgf("Could not obtain the alias of the peer with nodeId: %v (for Torq nodeId: %v)", channel.RemoteNodeId, ncd.NodeId)
				}
				channelsBody = append(channelsBody, chanBody)
			}
		}
	}
	c.JSON(http.StatusOK, channelsBody)
}

func calculateHTLCs(htlcs []commons.Htlc) PendingHtlcs {
	var pendingHTLCs PendingHtlcs
	if len(htlcs) < 1 {
		return pendingHTLCs
	}
	for _, htlc := range htlcs {
		if htlc.ForwardingHtlcIndex == 0 {
			pendingHTLCs.LocalCount++
			pendingHTLCs.LocalAmount += htlc.Amount
		} else {
			pendingHTLCs.ForwardingCount++
			pendingHTLCs.ForwardingAmount += htlc.Amount
		}
	}
	pendingHTLCs.TotalAmount = pendingHTLCs.ForwardingAmount + pendingHTLCs.LocalAmount
	pendingHTLCs.TotalCount = pendingHTLCs.ForwardingCount + pendingHTLCs.LocalCount

	return pendingHTLCs
}
